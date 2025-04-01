import mongoose  from "mongoose";

export const connectDB = async ()=>{
    (await mongoose.connect('mongodb+srv://foodDel:FoodDelviery@cluster0.bibpk.mongodb.net/food-del').then(()=>console.log("DB Connected")));
}