let localSavedLikes = JSON.parse(localStorage.getItem("savedLikes"));
if(!localSavedLikes)
    localSavedLikes = [];
var members = document.getElementById("members");




function loadImage(obj) {
  var img = document.createElement("img"); 

  //document.addEventListener('change', valCheck, false);

  const figure = document.createElement("figure");

  const figcaption = document.createElement("figcaption");
  const containElements = document.createElement("containElements");
  const divButtonRight = document.createElement("divButtonRight");
  const divButtonLeft = document.createElement("divButtonLeft");
  const likeContainer = document.createElement("likeContainer");
  const dislikeContainer = document.createElement("dislikeContainer");

 
  var checkbox = document.createElement('input');
  var checkbox2 = document.createElement('input');

  var pleft = document.createElement("bruh"); //paraghraphLeft
  likeContainer.setAttribute("class", "likeClass");
  dislikeContainer.setAttribute("class", "dislikeClass");

  
  figcaption.innerText = obj.name; 
  checkbox.type = 'checkbox';
  checkbox.setAttribute("id", obj.fileName + "like");
  checkbox.name = obj.fileName;
  checkbox.lVal = 1;
  checkbox.setAttribute("onclick", "checkValue(this)");
  
  checkbox2.type = 'checkbox';
  checkbox2.setAttribute("id", obj.fileName + "dislike");
  checkbox2.name = obj.fileName;
  checkbox2.lVal = -1;
  checkbox2.setAttribute("onclick", "checkValue(this)");


  figure.id = obj.fileName;
  figure.style.height = '216px';
  figure.style.width = '216px';
  
  pleft.innerText = obj.likes;
  pleft.id = obj.fileName + "likes";
 

  img.src = obj.fileName;  //

  //any html elements are objects you can just add variables and values
  checkbox.state = "like";
  checkbox2.state = "dislike";
  checkbox.Ohandle = checkbox2;
  checkbox2.Ohandle = checkbox;
  checkbox.likeCounter = pleft;
  checkbox2.likeCounter = pleft;

  img.style.height = '216px';
  img.style.width = '216px';



 
  likeContainer.appendChild(checkbox);
  dislikeContainer.appendChild(checkbox2);

  divButtonLeft.appendChild(likeContainer);
  divButtonLeft.appendChild(pleft);
  divButtonLeft.appendChild(dislikeContainer);
  divButtonLeft.appendChild(figcaption);

  containElements.appendChild(divButtonLeft);
  
 
  figure.appendChild(img);
  figure.appendChild(containElements);


  members.appendChild(figure);
}
function changeStatebyName(fName, state){
const Index = localSavedLikes.findIndex(e => e.fileName == fName);
localSavedLikes[Index].state = state;
}


 function checkValue(obj) {
        var checkbox1 = obj;
        var checkbox2 = obj.Ohandle;
        var likes = obj.likeCounter;
        if (!(localSavedLikes.some(e => e.fileName == obj.name))) {
          localSavedLikes.push(new data(obj.name, 'n'));
        }

         if (checkbox1.checked && checkbox2.checked) {
                //change checkbox
                 checkbox2.checked = false;
                 socket.emit('like',obj.name,obj.lVal*2);
                 likes.innerText = Number(likes.innerText) + obj.lVal*2;
                 changeStatebyName(obj.name, obj.state);
         }
         else if  (!checkbox1.checked && !checkbox2.checked){
            socket.emit('like',obj.name,obj.lVal*-1);
            likes.innerText = Number(likes.innerText) + obj.lVal*-1;
            changeStatebyName(obj.name, 'n');
          //MoreCodeHere
         }
         else {
            socket.emit('like',obj.name,obj.lVal);
            likes.innerText = Number(likes.innerText) + obj.lVal;
            changeStatebyName(obj.name, obj.state);
         }
         localStorage.setItem("savedLikes", JSON.stringify(localSavedLikes));
         localSavedLikes.forEach(element => loadSavedLikes(element));
}
        function loadSavedLikes(e) {
            if(e.state != "n" && document.getElementById(e.fileName + e.state))
            {
                let handle = document.getElementById(e.fileName + e.state);
                handle.checked = true;
            }
        }

        let socket = io();
        let dataBase;

        socket.on('dataBase', function (data) {
        dataBase=data;
        dataBase.forEach(element => loadImage(element));
        localSavedLikes.forEach(element => loadSavedLikes(element));
        });

        socket.on('newImg', function (data) {
        loadImage(data);
        });

        socket.on('updatedDatabase', function (data) {
        var members = document.getElementById("members");
        while (members.firstChild) {
          members.removeChild(members.lastChild);
        }
        dataBase=data;
        dataBase.forEach(element => loadImage(element));
        localSavedLikes.forEach(element => loadSavedLikes(element));
        });

        socket.on('deleteAllImgs', function (data) {
          var members = document.getElementById("members");
          while (members.firstChild) {
            members.removeChild(members.lastChild);
          }
          dataBase=data;
          localStorage.clear();
        });

        socket.on('deletedImg', function (imgName) {

        var element = document.getElementById(imgName);
        var members = document.getElementById("members");
        members.removeChild(element);
        const Index = localSavedLikes.findIndex(e => e.fileName == imgName);
        localSavedLikes.splice(Index, 1);
        localStorage.setItem("savedLikes", JSON.stringify(localSavedLikes));
        })

        socket.on('updatedLikes', function (data) {
        data.forEach(element => updateLikes(element));
        if(data.length<1)
            return;
        if(!(document.getElementById("BigImg")))
            {
            let img = document.createElement("img");
            img.src = data[0].fileName;
            img.id = "BigImg"
            let hold = document.createElement("div");
            let p = document.createElement("p");
            let by = document.createElement("by");
            p.innerText = "Top rated drawing";
            by.id = "by";
            by.innerText = "By: " + data[0].name
            hold.appendChild(p);
            hold.appendChild(by);
            let imgW = document.getElementById("image-wrapper");
            imgW.appendChild(img);
            imgW.appendChild(hold);
            }
            else
            {
                document.getElementById("BigImg").src = data[0].fileName;
                document.getElementById("by").innerText ="By: " + data[0].name
            }
        });

        function updateLikes(obj) {
            element = document.getElementById(obj.fileName + "likes");
            element.innerText = obj.likes;
        }


        //socket.emit('like',"img0.png",1);


        function data(fileName, state) {
            this.fileName = fileName;
            this.state = state;
        }