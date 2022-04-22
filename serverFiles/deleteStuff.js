var members = document.getElementById("members");

function loadImage(obj) {
  var img = document.createElement("img");
  const figure = document.createElement("figure");
  const delButton = document.createElement("button");
  delButton.innerText = "delete";
  delButton.name = obj.fileName;
  delButton.setAttribute( "onClick", "javascript: deleteImg(this.name);" );

//  figure.style.margin = "50px 10px 20px 30px"
  const figcaption = document.createElement("figcaption");
  figcaption.innerText = obj.name;

  img.src = obj.fileName;  // Give it address
  img.style.height = '216px';
  img.style.width = '216px';

  figure.id = obj.fileName;

  figure.appendChild(img);
  figure.appendChild(figcaption);
  figure.appendChild(delButton);
  members.appendChild(figure);
  
}

        let socket = io();
        let dataBase;

        socket.on('dataBase', function (data) {
        dataBase=data;
        console.log(dataBase);
        dataBase.forEach(element => loadImage(element));
        });

        socket.on('newImg', function (data) {
        console.log('made');
        loadImage(data);
        });
        //socket.emit('like',"img0.png",1);
        function deleteImg(fileName){
          password = $("#pass").val();
          socket.emit('deleteImg',fileName, password);
        }

        socket.on('updatedDatabase', function (data) {

        var members = document.getElementById("members");
        while (members.firstChild) {
          members.removeChild(members.lastChild);
        }
        dataBase=data;
        dataBase.forEach(element => loadImage(element));
        });

        socket.on('deletedImg', function (imgName) {
        var element = document.getElementById(imgName);
        var members = document.getElementById("members");
        members.removeChild(element);
        });

        socket.on('deleteAllImgs', function (data) {
          var members = document.getElementById("members");
          while (members.firstChild) {
            members.removeChild(members.lastChild);
          }
          dataBase=data;
        });

        function deleteAll(){
          if (confirm("Are you sure?") != true) 
            return;
          password = $("#pass").val();
          socket.emit('deleteAllImg', password);
        }