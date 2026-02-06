#!/bin/bash
echo "########### Creating S3 Bucket ###########"
awslocal s3 mb s3://knowledge-base-bucket
echo "########### S3 Bucket Created ###########"