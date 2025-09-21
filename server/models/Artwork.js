const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['음악', '미술', '문학', '공연'],
    },
    type: {
      type: String,
      required: true,
      enum: ['audio', 'image', 'video', 'text'],
    },
    thumbnail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: String, // For audio/video
    dimensions: String, // For visual art
    plays: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    metadata: {
      fileSize: Number,
      format: String,
      resolution: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
artworkSchema.index({ artist: 1, category: 1 });
artworkSchema.index({ category: 1, createdAt: -1 });
artworkSchema.index({ likes: -1, createdAt: -1 });
artworkSchema.index({ title: 'text', description: 'text' });

// Virtual for total engagement
artworkSchema.virtual('totalEngagement').get(function () {
  return this.plays + this.views + this.likes;
});

// Pre-save middleware to update updatedAt
artworkSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Artwork', artworkSchema);
