'use client';

'use client';

import { Button } from '@/components/ui/button';
// import Button from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Folder, Image, Loader2, Palette, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TopicModal = ({
  open,
  setOpen,
  topics = [],
  onSuccess,
  topic = null,
}) => {
  const { authenticatedFetch } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [coverImage, setCoverImage] = useState('');
  const [parentId, setParentId] = useState('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic) {
      setName(topic.name || '');
      setDescription(topic.description || '');
      setIcon(topic.icon || '');
      setColor(topic.color || '#3b82f6');
      setCoverImage(topic.coverImage || '');
      setParentId(topic.parentId || 'none');
    } else {
      setName('');
      setDescription('');
      setIcon('');
      setColor('#3b82f6');
      setCoverImage('');
      setParentId('none');
    }
  }, [topic, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        icon,
        color,
        coverImage,
        parentId: parentId === 'none' ? null : parentId,
      };

      const url = topic
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/topic/${topic.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/topic`;

      const method = topic ? 'PUT' : 'POST';

      const res = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log('Response:', { status: res.status, data });

      if (res.ok && data.success) {
        toast.success(`Topic ${topic ? 'updated' : 'created'} successfully`);
        onSuccess && onSuccess(data.data);
        setOpen(false);
      } else {
        console.error('API Error:', data);
        toast.error(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Request Error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {topic ? (
              <>
                <Tag className="h-6 w-6 text-blue-600" />
                Edit Topic
              </>
            ) : (
              <>
                <Tag className="h-6 w-6 text-green-600" />
                Create New Topic
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {topic
              ? 'Update your topic with new details and settings'
              : 'Add a new topic to organize your content effectively'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          {/* Topic Preview */}
          {(name || icon || color) && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Preview
              </Label>
              <div
                className="flex items-center gap-3 p-3 rounded-md border-2 border-dashed"
                style={{
                  borderColor: color || '#e5e7eb',
                  backgroundColor: `${color}10`,
                }}
              >
                {icon && <span className="text-xl">{icon}</span>}
                <div>
                  <div className="font-semibold text-gray-900">
                    {name || 'Topic Name'}
                  </div>
                  {description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4" />
                Topic Name *
              </Label>
              <Input
                placeholder="Enter topic name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Tag className="h-4 w-4" />
                Icon / Emoji
              </Label>
              <Input
                placeholder="📚 or any emoji"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <Textarea
              placeholder="Brief description of this topic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Visual Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Palette className="h-4 w-4" />
                Theme Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 p-1 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Image className="h-4 w-4" />
                Cover Image URL
              </Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Parent Topic */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium">
              <Folder className="h-4 w-4" />
              Parent Topic
            </Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select parent topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-400" />
                    No Parent (Root Level)
                  </div>
                </SelectItem>
                {topics
                  .filter((t) => t.id !== topic?.id)
                  .map((topicItem) => (
                    <SelectItem key={topicItem.id} value={topicItem.id}>
                      <div className="flex items-center gap-2">
                        {topicItem.icon && <span>{topicItem.icon}</span>}
                        <span>{topicItem.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 transition-all duration-200 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {topic ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{topic ? 'Update Topic' : 'Create Topic'}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TopicModal;
