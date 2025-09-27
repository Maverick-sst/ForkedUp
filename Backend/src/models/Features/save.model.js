const mongoose=require("mongoose");

const saveSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "foodModel",
        required: true
    }
},{
    timestamps:true
}
);
saveSchema.index({user:1,video:1},{unique:true});
saveSchema.index({user:1,createdAt:-1});
const saveSchemaModel=mongoose.model("saveModel",saveSchema);
module.exports=saveSchemaModel;