const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// 모든 카테고리 조회
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 특정 카테고리 조회
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      id: req.params.id,
      isActive: true,
    });
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 카테고리 생성 (관리자용)
router.post('/', async (req, res) => {
  try {
    const { id, label, icon, order } = req.body;

    if (!id || !label) {
      return res.status(400).json({ message: 'ID와 라벨은 필수입니다.' });
    }

    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: '이미 존재하는 카테고리 ID입니다.' });
    }

    const category = new Category({
      id,
      label,
      icon,
      order: order || 0,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({
      message: '카테고리 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 카테고리 수정 (관리자용)
router.put('/:id', async (req, res) => {
  try {
    const { label, icon, order, isActive } = req.body;

    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    }

    if (label) category.label = label;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      message: '카테고리 수정 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 카테고리 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    }

    // 실제 삭제 대신 비활성화
    category.isActive = false;
    await category.save();

    res.json({ message: '카테고리가 비활성화되었습니다.' });
  } catch (error) {
    res.status(500).json({
      message: '카테고리 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

module.exports = router;
