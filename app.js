const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

mongoose.connect("mongodb+srv://admin-ashu:ashutoshkr24012001@cluster0.hzv5n.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema=new mongoose.Schema ({
  name: String
});

const Item=mongoose.model("Item", itemsSchema);

const item1=new Item ({
  name: "Cricket"
});
const item2=new Item ({
  name: "Code"
});
const item3=new Item ({
  name: "Gym"
});
const defaultItems=[item1, item2, item3];

const listsSchema=new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List=mongoose.model("List", listsSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", function(req, res){
  Item.find({}, function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added items to the collection");
          res.redirect("/");
        }
      });
    }else{
      res.render("list", {listTitle: "Today", listItems: foundItems});
    }
  });
});
app.post("/", function(req, res){
  let itemName=req.body.newItem;
  let listName=req.body.list;
  const item= new Item ({
    name: itemName
  });
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deletion Successful");
      }
    });
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});
app.get("/:customListName", function(req, res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err,lists){
    if(!err){
      if(!lists){
        const list= new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: lists.name, listItems: lists.items});
      }
    }
  });
});
app.get("/about", function(req, res){
  res.render("about");
});
app.listen(3000, function(){
  console.log("Server started running on port 3000");
});
