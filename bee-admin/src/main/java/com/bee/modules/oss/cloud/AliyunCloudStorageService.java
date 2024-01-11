package com.bee.modules.oss.cloud;

import com.aliyun.oss.OSSClient;
import com.bee.common.exception.BeeException;
import com.bee.common.exception.ErrorCode;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;

/**
 * @author Bruce
 * @create 2024/01/11
 * @description 阿里云存储
 */
public class AliyunCloudStorageService extends AbstractCloudStorageService{

    public AliyunCloudStorageService(CloudStorageConfig config) {
        this.config = config;
    }

    @Override
    public String upload(byte[] data, String path) {
        return upload(new ByteArrayInputStream(data), path);
    }

    @Override
    public String uploadSuffix(byte[] data, String suffix) {
        return upload(data, getPath(config.getAliyunPrefix(), suffix));
    }

    @Override
    public String upload(InputStream inputStream, String path) {
        OSSClient client = new OSSClient(config.getAliyunEndPoint(),
                config.getAliyunAccessKeyId(),
                config.getAliyunAccessKeySecret());
        try {
            client.putObject(config.getAliyunBucketName(), path, inputStream);
            client.shutdown();
        } catch (Exception e) {
            throw new BeeException(ErrorCode.OSS_UPLOAD_FILE_ERROR);
        }

        return config.getAliyunDomain() + File.separator + path;
    }

    @Override
    public String uploadSuffix(InputStream inputStream, String suffix) {
        return upload(inputStream, getPath(config.getAliyunPrefix(), suffix));
    }
}
