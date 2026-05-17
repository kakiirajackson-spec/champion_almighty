const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for posts
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
    resource_type: 'auto',
  },
});

// Storage for stories
const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
    resource_type: 'auto',
  },
});

// Storage for profile pictures
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image',
  },
});

const uploadPost = multer({ storage: postStorage });
const uploadStory = multer({ storage: storyStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { cloudinary, uploadPost, uploadStory, uploadAvatar };