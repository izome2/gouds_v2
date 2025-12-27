const express = require('express');
const router = express.Router();
const {
  addCategory,
  addAllCategory,
  getAllCategory,
  getAllCategories,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateCategoryOrder,
  updateCategoryLabels,
  updateStatus,
  deleteCategory,
  deleteManyCategory,
  updateManyCategory
} = require('../controller/categoryController');

//add a category
router.post('/add', addCategory);

//add all category
router.post('/add/all', addAllCategory);

//get only showing category
router.get('/show', getShowingCategory);

//get all category
router.get('/', getAllCategory);

//get all category
router.get('/all', getAllCategories);

//get a category
router.get('/:id', getCategoryById);

//update a category
router.put('/:id', updateCategory);

//update category order
router.put('/update-order', updateCategoryOrder);

//update category labels
router.put('/:id/labels', updateCategoryLabels);

//show/hide a category
router.put('/status/:id', updateStatus);

//delete a category
router.delete('/:id', deleteCategory);

// delete many category
router.patch('/delete/many', deleteManyCategory);

// update many category
router.patch('/update/many', updateManyCategory);

module.exports = router;