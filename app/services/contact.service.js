const { ObjectId } = require("mongodb");

class ContactService {
  constructor(db) {
    this.collection = db.collection("contacts"); // tạo collection "contacts"
  }

  async create(payload) {
    const result = await this.collection.insertOne(payload);
    return result.ops ? result.ops[0] : { _id: result.insertedId, ...payload };
  }

  async find(filter) {
    return await this.collection.find(filter).toArray();
  }

  async findByName(name) {
    return await this.collection
      .find({ name: { $regex: name, $options: "i" } })
      .toArray();
  }
   async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
// 👇 Thêm hàm này vào
  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite === true,
    };

    // loại bỏ field nào undefined
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );

    return contact;
  }
async update(id, payload) {
  const filter = {
    _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
  };

  const update = this.extractContactData(payload);
  if (Object.keys(update).length === 0) {
    return null; // không có gì để update
  }

  const result = await this.collection.findOneAndUpdate(
    filter,
    { $set: update },
    { returnDocument: "after" }  // MongoDB v6 option
  );

  // Trả về cả metadata để biết có update hay không
  return result;

}
async delete(id) {
  const result = await this.collection.findOneAndDelete({
    _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
  });
  return result;
}
async findFavorite() {
  return await this.find({ favorite: true });
}
async deleteAll() {
  const result = await this.collection.deleteMany({});
  return result.deletedCount;   // số documents bị xoá
}
}
module.exports = ContactService;