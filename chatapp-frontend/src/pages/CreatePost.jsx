import React, { useState } from 'react';
import { ArrowLeft, Image, Film } from 'lucide-react';
import { API } from '../api';

const CreatePost = ({ token, currentUser, onDone }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
  };

  const handlePost = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    try {
      await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      onDone();
    } catch (err) {
      console.error(err);
      alert('Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[470px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button onClick={step === 1 ? onDone : () => setStep(1)}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold">Create new post</h2>
        {step === 2
          ? <button onClick={handlePost} disabled={loading} className="text-blue-500 font-bold text-sm disabled:opacity-50">
              {loading ? 'Sharing...' : 'Share'}
            </button>
          : <div />
        }
      </div>

      {step === 1 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center">
            <Image size={40} className="text-zinc-500" />
          </div>
          <p className="text-lg font-semibold">Share a photo or video</p>
          <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg cursor-pointer transition-colors">
            Select from device
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}

      {step === 2 && preview && (
        <div>
          {/* Preview */}
          <div className="w-full bg-zinc-900 aspect-square overflow-hidden">
            {file?.type.startsWith('video')
              ? <video src={preview} controls className="w-full h-full object-cover" />
              : <img src={preview} alt="preview" className="w-full h-full object-cover" />
            }
          </div>

          {/* Caption */}
          <div className="flex items-start gap-3 px-4 py-4 border-b border-zinc-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.username?.[0]?.toUpperCase()}
            </div>
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none resize-none placeholder-zinc-600 pt-1"
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;