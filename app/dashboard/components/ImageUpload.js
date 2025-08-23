'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageUpload({
  label = 'Upload Image',
  className = 'w-full h-32',
  accept = { 'image/*': [] },
  multiple = false,
  maxFiles = 1,
  setImage,
  imagePreview = null,
}) {
  const [localPreview, setLocalPreview] = useState(imagePreview);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }

      setUploadStatus('uploading');

      // Simulate upload delay
      setTimeout(() => {
        const preview = URL.createObjectURL(file);
        setLocalPreview(preview);
        setImage(file);
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 2000);
      }, 800);
    },
    [setImage]
  );

  const removeImage = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setImage(null);
    setUploadStatus('idle');
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  useEffect(() => {
    setIsDragActive(dropzoneActive);
  }, [dropzoneActive]);

  useEffect(() => {
    setLocalPreview(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'border-blue-400 bg-blue-50';
      case 'success':
        return 'border-emerald-400 bg-emerald-50';
      case 'error':
        return 'border-red-400 bg-red-50';
      default:
        return isDragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-slate-300 bg-slate-50';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        );
      case 'success':
        return <Check className="w-6 h-6 text-emerald-600" />;
      case 'error':
        return <X className="w-6 h-6 text-red-600" />;
      default:
        return (
          <Upload
            className={cn(
              'w-6 h-6',
              isDragActive ? 'text-blue-600' : 'text-slate-500'
            )}
          />
        );
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed. File too large or invalid format.';
      default:
        return isDragActive
          ? 'Drop the image here'
          : 'Drag & drop or click to upload';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>

      {localPreview ? (
        <div
          className={cn('relative group rounded-xl overflow-hidden', className)}
        >
          <Image
            src={localPreview}
            width={400}
            height={400}
            alt="Preview"
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Controls */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={removeImage}
                className="bg-white/90 hover:bg-white text-slate-700 border border-white/50 rounded-full shadow-lg backdrop-blur-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-slate-700 border border-white/50 rounded-full shadow-lg backdrop-blur-sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            </div>
          </div>

          {/* Success indicator */}
          {uploadStatus === 'success' && (
            <div className="absolute top-3 right-3">
              <div className="bg-emerald-100 border border-emerald-200 rounded-full p-2">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-slate-400',
            getStatusColor(),
            className
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center space-y-3 p-6">
            {getStatusIcon()}

            <div className="text-center">
              <p
                className={cn(
                  'font-medium text-sm',
                  uploadStatus === 'error'
                    ? 'text-red-600'
                    : uploadStatus === 'success'
                    ? 'text-emerald-600'
                    : uploadStatus === 'uploading'
                    ? 'text-blue-600'
                    : isDragActive
                    ? 'text-blue-600'
                    : 'text-slate-600'
                )}
              >
                {getStatusText()}
              </p>

              {uploadStatus === 'idle' && (
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
