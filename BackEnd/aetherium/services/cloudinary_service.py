# services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, Dict, Any
from fastapi import HTTPException, UploadFile
import os,time,io,asyncio
from pathlib import Path
from aetherium.config import settings


class CloudinaryService:
    def __init__(self):
        # Configure cloudinary
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
    
#     async def upload_file(self, file: UploadFile, folder: str = "elearning",resource_type: str = "auto") -> Dict[str, Any]:
#         """
#         Upload file to Cloudinary
        
#         Args:
#             file: UploadFile object from FastAPI
#             folder: Cloudinary folder to upload to
#             resource_type: Type of resource (auto, image, video, raw)
        
#         Returns:
#             Dict containing upload information
#         """
#         try:
#             # Generate unique filename
#             file_extension = Path(file.filename).suffix
#             filename = f"{folder}/{file.filename}"
            
#             # Upload to Cloudinary
#             result = cloudinary.uploader.upload(
#                 file.file,
#                 public_id=filename,
#                 resource_type=resource_type,
#                 folder=folder,
#                 overwrite=True,
#                 invalidate=True,
#                 quality="auto",
#                 fetch_format="auto"
#             )
            
#             return {
#                 "public_id": result["public_id"],
#                 "url": result["secure_url"],
#                 "file_type": result["resource_type"],
#                 "file_size": result["bytes"],
#                 "width": result.get("width"),
#                 "height": result.get("height"),
#                 "duration": result.get("duration"),  # For videos
#                 "format": result["format"]
#             }
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Failed to upload file: {str(e)}"
#             )
#     async def upload_video(self, file: UploadFile, folder: str = "elearning/videos") -> Dict[str, Any]:
#         """Upload video file with video-specific optimizations"""
#         try:
#             result = cloudinary.uploader.upload(
#                 file.file,
#                 resource_type="video",
#                 folder=folder,
#                 overwrite=True,
#                 invalidate=True,
#                 quality="auto",
#                 video_codec="h264",
#                 audio_codec="aac"
#             )

#             # Generate thumbnail only if public_id exists
#             thumbnail_url = ""
#             if result.get("public_id"):
#                 try:
#                     thumbnail_url = cloudinary.CloudinaryImage(result["public_id"]).image(
#                         resource_type="video",
#                         format="jpg",
#                         transformation=[
#                             {"width": 400, "height": 300, "crop": "fill"},
#                             {"quality": "auto"}
#                         ]
#                     )
#                 except Exception as thumb_error:
#                     # Log the thumbnail error but don't fail the entire upload
#                     print(f"Failed to generate thumbnail: {thumb_error}")
#                     thumbnail_url = ""

#             return {
#                 "public_id": result.get("public_id", ""),
#                 "url": result.get("secure_url", ""),
#                 "file_type": "video",
#                 "file_size": result.get("bytes", 0),
#                 "duration": result.get("duration"),
#                 "width": result.get("width"),
#                 "height": result.get("height"),
#                 "thumbnail": thumbnail_url,
#                 "format": result.get("format", "")
#             }

#         except Exception as e:
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Failed to upload video: {str(e)}"
#             )    
#     # async def upload_video(self, file: UploadFile, folder: str = "elearning/videos") -> Dict[str, Any]:
#     #     """Upload video file with video-specific optimizations"""
#     #     try:
#     #         result = cloudinary.uploader.upload(
#     #             file.file,
#     #             resource_type="video",
#     #             folder=folder,
#     #             overwrite=True,
#     #             invalidate=True,
#     #             quality="auto",
#     #             video_codec="h264",
#     #             audio_codec="aac"
#     #         )
            
#     #         # Generate thumbnail
#     #         thumbnail_url = cloudinary.CloudinaryImage(result["public_id"]).image(
#     #             resource_type="video",
#     #             format="jpg",
#     #             transformation=[
#     #                 {"width": 400, "height": 300, "crop": "fill"},
#     #                 {"quality": "auto"}
#     #             ]
#     #         )
            
#     #         return {
#     #             "public_id": result["public_id"],
#     #             "url": result["secure_url"],
#     #             "file_type": "video",
#     #             "file_size": result["bytes"],
#     #             "duration": result.get("duration"),
#     #             "width": result.get("width"),
#     #             "height": result.get("height"),
#     #             "thumbnail": thumbnail_url,
#     #             "format": result["format"]
#     #         }
            
#     #     except Exception as e:
#     #         raise HTTPException(
#     #             status_code=500,
#     #             detail=f"Failed to upload video: {str(e)}"
#     #         )
    

#     def upload_pdf(self, file: UploadFile, folder: str = "elearning/pdfs") -> Dict[str, Any]:
#         """Upload PDF file"""
#         try:
#             result = cloudinary.uploader.upload(
#                 file.file,
#                 resource_type="raw",
#                 folder=folder,
#                 overwrite=True,
#                 invalidate=True
#             )

#             return {
#                 "public_id": result.get("public_id", ""),
#                 "url": result.get("secure_url", ""),
#                 "file_type": "pdf",
#                 "file_size": result.get("bytes", 0),
#                 "format": result.get("format", "") 
#             }

#         except Exception as e:
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Failed to upload PDF: {str(e)}"
#             )
    
#     async def delete_file(self, public_id: str, resource_type: str = "auto") -> bool:
#         """Delete file from Cloudinary"""
#         try:
#             result = cloudinary.uploader.destroy(
#                 public_id,
#                 resource_type=resource_type,
#                 invalidate=True
#             )
#             return result.get("result") == "ok"
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Failed to delete file: {str(e)}"
#             )
    
#     def get_file_info(self, public_id: str, resource_type: str = "auto") -> Dict[str, Any]:
#         """Get file information from Cloudinary"""
#         try:
#             result = cloudinary.api.resource(public_id, resource_type=resource_type)
#             return result
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=404,
#                 detail=f"File not found: {str(e)}"
#             )
    
#     def generate_signed_url(
#         self, 
#         public_id: str, 
#         resource_type: str = "auto",
#         expires_in: int = 3600
#     ) -> str:
#         """Generate signed URL for private resources"""
#         try:
#             timestamp = int(time.time()) + expires_in
            
#             url = cloudinary.utils.cloudinary_url(
#                 public_id,
#                 resource_type=resource_type,
#                 sign_url=True,
#                 type="authenticated",
#                 version=timestamp
#             )[0]
            
#             return url
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Failed to generate signed URL: {str(e)}"
#             )

# # Initialize service
# cloudinary_service = CloudinaryService()

    async def upload_video_from_stream(
    self, 
    file_stream: io.BytesIO, 
    filename: str, 
    folder: str = "elearning/videos") -> Dict[str, Any]:
        """Robust video upload with chunking support"""
        try:
            # Create isolated copy of the stream
            file_stream.seek(0)
            file_content = file_stream.read()
            new_stream = io.BytesIO(file_content)

            def _upload():
                new_stream.seek(0)
                return cloudinary.uploader.upload(
                    new_stream,
                    resource_type="video",
                    folder=folder,
                    filename=filename,
                    use_filename=True,
                    unique_filename=True,
                    timeout=300,  # 5 minute timeout
                    chunk_size=6*1024*1024,  # 6MB chunks
                    eager=[  # Generate thumbnail eagerly
                        {
                            "width": 400,
                            "height": 300,
                            "crop": "fill",
                            "format": "jpg"
                        }
                    ]
                )

            result = await asyncio.get_event_loop().run_in_executor(None, _upload)

            # Ensure we have required fields
            if not all(k in result for k in ['secure_url', 'public_id']):
                raise ValueError("Invalid Cloudinary response")

            return {
                "public_id": result["public_id"],
                "url": result["secure_url"],
                "file_type": "video",
                "file_size": result.get("bytes", len(file_content)),
                "duration": result.get("duration", 0),
                "thumbnail": result.get("thumbnail_url", "")
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload video: {str(e)}"
            )


    async def upload_pdf_from_stream(self, file_stream: io.BytesIO, filename: str, folder: str = "elearning/pdfs") -> Dict[str, Any]:
        """Upload PDF file from stream with robust handling"""
        try:
            # Create a fresh copy of the stream to ensure isolation
            file_stream.seek(0)
            file_content = file_stream.read()
            new_stream = io.BytesIO(file_content)

            def _upload():
                new_stream.seek(0)
                return cloudinary.uploader.upload(
                    new_stream,
                    resource_type="raw",
                    folder=folder,
                    filename=filename,
                    use_filename=True,
                    unique_filename=True,
                    timeout=60
                )

            result = await asyncio.get_event_loop().run_in_executor(None, _upload)

            if not result.get('secure_url'):
                raise ValueError("Cloudinary upload failed - no URL returned")

            return {
                "public_id": result["public_id"],
                "url": result["secure_url"],
                "file_type": "pdf",
                "file_size": result.get("bytes", len(file_content)),
                "format": result.get("format", "pdf")
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload PDF: {str(e)}"
            )
    
    async def upload_file_from_stream(self, file_stream: io.BytesIO, filename: str, folder: str = "elearning/files") -> Dict[str, Any]:
        """Upload general file from stream"""
        try:
            def _upload():
                return cloudinary.uploader.upload(
                    file_stream,
                    resource_type="auto",
                    folder=folder,
                    overwrite=True,
                    invalidate=True,
                    timeout=60,
                    filename=filename
                )
            
            result = await asyncio.get_event_loop().run_in_executor(None, _upload)

            return {
                "public_id": result.get("public_id", ""),
                "url": result.get("secure_url", ""),
                "file_type": "file",
                "file_size": result.get("bytes", 0),
                "format": result.get("format", "")
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    # Keep your existing methods for backward compatibility
    async def upload_video(self, file: UploadFile, folder: str = "elearning/videos") -> Dict[str, Any]:
        """Upload video file with video-specific optimizations"""
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        return await self.upload_video_from_stream(file_stream, file.filename, folder)
    
    def upload_pdf(self, file: UploadFile, folder: str = "elearning/pdfs") -> Dict[str, Any]:
        """Upload PDF file"""
        try:
            result = cloudinary.uploader.upload(
                file.file,
                resource_type="raw",
                folder=folder,
                overwrite=True,
                invalidate=True,
                timeout=60
            )

            return {
                "public_id": result.get("public_id", ""),
                "url": result.get("secure_url", ""),
                "file_type": "pdf",
                "file_size": result.get("bytes", 0),
                "format": result.get("format", "") 
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload PDF: {str(e)}"
            )
    
    async def delete_file(self, public_id: str, resource_type: str = "auto") -> bool:
        """Delete file from Cloudinary"""
        try:
            def _delete():
                return cloudinary.uploader.destroy(
                    public_id,
                    resource_type=resource_type,
                    invalidate=True
                )
            
            result = await asyncio.get_event_loop().run_in_executor(None, _delete)
            return result.get("result") == "ok"
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {str(e)}"
            )
    
    def get_file_info(self, public_id: str, resource_type: str = "auto") -> Dict[str, Any]:
        """Get file information from Cloudinary"""
        try:
            result = cloudinary.api.resource(public_id, resource_type=resource_type)
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {str(e)}"
            )
    
    def generate_signed_url(
        self, 
        public_id: str, 
        resource_type: str = "auto",
        expires_in: int = 3600
    ) -> str:
        """Generate signed URL for private resources"""
        try:
            timestamp = int(time.time()) + expires_in
            
            url = cloudinary.utils.cloudinary_url(
                public_id,
                resource_type=resource_type,
                sign_url=True,
                type="authenticated",
                version=timestamp
            )[0]
            
            return url
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate signed URL: {str(e)}"
            )

# Initialize service
cloudinary_service = CloudinaryService()