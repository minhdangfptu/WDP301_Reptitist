const mongoose = require('mongoose');

const apiRouteSchema = new mongoose.Schema({
  name: { type: String, required: true },             // Tên quyền hoặc hành động (ví dụ: view_reptile_info)
  module: { type: String, required: true },           // Tên module hoặc phân hệ (ví dụ: reptile)
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
  api_path: { type: String, required: true }          // Đường dẫn API (ví dụ: /api/reptiles)
}, {
  collection: 'permissions' // hoặc tùy tên bạn đặt
});

module.exports = mongoose.model('ApiRoute', apiRouteSchema);
