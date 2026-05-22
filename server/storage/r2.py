import boto3
import os
from botocore.config import Config

BUCKET = os.environ.get("R2_BUCKET_NAME", "downstream-files")

def get_r2_client() -> boto3.client:
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['CF_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

def upload_file(file_obj, key: str) -> str:
    """Upload a file and return its storage key."""
    client = get_r2_client()
    print("Client successfuly retrieved: \n", client)
    client.upload_fileobj(file_obj, BUCKET, key)
    return key

def download_file(key: str):
    """Return a pre-signed URL valid for 1 hour."""
    client = get_r2_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=3600,
    )

def delete_file(key: str):
    client = get_r2_client()
    client.delete_object(Bucket=BUCKET, Key=key)