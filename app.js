const express= require("express");
const bodyParser = require("body-parser");
const https=require("https");
const mongoose=require("mongoose");
const _=require("lodash");
const { log } = require("console");
// const date=require(__dirname+"/date.js")
// console.log(date);

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-hamad:Test123@cluster0.aprtwxm.mongodb.net/todolistDB" , {useNewUrlParser: true}, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Connected Successfully")
    }
});

// const items=["Buy Food", "Cook Food","Eat food"];
// const workItems=[];

//Schema
const itemsSchema={
    name: String
}
// Model 
const Item= mongoose.model("Item", itemsSchema);

//Default Items
const item1= new Item({name: "Welcome to your todolist!"});
const item2= new Item({name: "Hit the + Button to add a new item"});
const item3= new Item({name: "<-- Hit This to delete an item"});
const defaultItems= [item1, item2, item3];

//List Schema
const listSchema= {
    name: String,
    items: [itemsSchema]
}
const List= mongoose.model("List", listSchema);



app.get("/", function(req,res){
    // const day=date.getDate();
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Items Added Successfully");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }    
        
    });
    
});

//Custom List
app.get("/:customListName", function(req,res){
    const paramName=_.capitalize(req.params.customListName);
        List.findOne({name:paramName},function(err, foundList){
            if(err){
                console.log(err)
            }else{
                // Display List If Found 
                if(foundList){
                    
                    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
                    console.log("List Already Exists");
                    
                }else{
                    //Create list if not found
                    const list=new List({
                        name: paramName,
                        items: defaultItems
                    });
                    list.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("Item Added Successfully");
                        }
                       
                    });
                    res.redirect("/"+paramName);
                }
            }
           })
    // }
  
});

app.post("/", function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item= new Item({
        name: itemName
    });
    //for default list
    if(listName==="Today"){
        item.save(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Item Added successfully")
                res.redirect("/")
            }
        });
        // for custom list 
    }else{
        List.findOne({name:listName}, function(err, foundList){
            if(!err){
                // console.log(foundList)
                //to the list which is found by the listName is pushed the new item
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            }
        })
    }
    
   
});

app.post("/delete", function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    console.log(checkedItemId)
    
    // Item.deleteMany({_id: checkedItemId}, function(err){
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Items Deleted Successfully");
                res.redirect("/");   
            }
        });
    }else{
        List.findOneAndUpdate({name:listName}, {$pull:{items: {_id: checkedItemId}}},function(err,foundList){
            if(err){
                console.log(err);
                
            }else{
                console.log(foundList);
                console.log("Item Deleted Successfully")
                res.redirect("/" +listName);
            }
        });
    }        
})


// app.get("/about", function(req,res){
//     res.render("about")
// })

app.listen(3000, function(){
    console.log("Server started at port 3000");
});






//EJS: is Used for templating(to escape repetition), the html files are stored in a views directory with the extension .ejs and and as mentioned in list.ejs variables are used in : (<%=EJS%>), where ejs is the name of the variable.
// if we want to render that html file we use res.render() method and pass it the arguments: name of the file and an object containing ejs as key and variable name as value:
// res.render("pageName", {ejs(variable name in page): variable name(here)})

// All the commented code: 
 // var days=["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // day= days[currentDay];
    // else{
    //     // res.write("<p>Its not the Weekend</p>");
    //     // res.write("<h1>Its a Working Day</h1>");
    //     // res.sendFile(__dirname+"/index.html");
    //     day="weekday";
        
    // }
    // var currentDay=today.getDay()