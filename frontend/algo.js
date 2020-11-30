(function ($) {
    $(document).ready(function () {
      
      generateID()
      choose()
      generateOption()
      selectionOption()
      removeClass()
      uploadImage()
      submit()
      resetButton()
      removeNotification()
      autoRemoveNotification()
      autoDequeue()
      
      var ID
      var way = 0
      var queue = []
      var fullStock = 10
      var speedCloseNoti = 1000
      
      function uploadImage() {
        var button = $('.images .pic')
        var uploader = $('<input type="file" accept="image/*" />')
        var images = $('.images')
        
        button.on('click', function () {
          uploader.click()
        })
        
        uploader.on('change', function () {
            var reader = new FileReader()
            reader.onload = function(event) {
              images.prepend('<div class="img" style="background-image: url(\'' + event.target.result + '\');" rel="'+ event.target.result  +'"><span>remove</span></div>')
            }
            reader.readAsDataURL(uploader[0].files[0])
    
         })
        
        images.on('click', '.img', function () {
          $(this).remove()
        })
      
      }
      
      function submit() {  
        var button = $('#send')
        
        button.on('click', function () {
          if(!way) {
            var title = $('#title')
            var cate  = $('#category')
            var images = $('.images .img')
            var imageArr = []
  
            
            for(var i = 0; i < images.length; i++) {
              imageArr.push({url: $(images[i]).attr('rel')})
            }
            
            var newStock = {
              title: title.val(),
              category: cate.val(),
              images: imageArr,
              type: 1
            }
            
            saveToQueue(newStock)
          } else {
            // discussion
            var topic = $('#topic')
            var message = $('#msg')
            
            var newStock = {
              title: topic.val(),
              message: message.val(),
              type: 2
            }
            
            saveToQueue(newStock)
          }
        })
      }
      
      // helpers
      function saveToQueue(stock) {
        var notification = $('.notification')
        var check = 0
        
        if(queue.length <= fullStock) {
          if(stock.type == 2) {
              if(!stock.title || !stock.message) {
                check = 1
              }
          } else {
            if(!stock.title || !stock.category || stock.images == 0) {
              check = 1
            }
          }
          
          if(check) {
            notification.append('<div class="error btn"><p><strong>Error:</strong> Please fill in the form.</p><span><i class=\"fa fa-times\" aria-hidden=\"true\"></i></span></div>')
          } else {
            notification.append('<div class="success btn"><p><strong>Success:</strong> '+ ID +' is submitted.</p><span><i class=\"fa fa-times\" aria-hidden=\"true\"></i></span></div>')
            queue.push(stock)
            reset()
          }
        } else {
          notification.append('<div class="error btn"><p><strong>Error:</strong> Please waiting a queue.</p><span><i class=\"fa fa-times\" aria-hidden=\"true\"></i></span></div>')
        } 
      }
      function reset() {
        
        $('#title').val('')
        $('.select-option .head').html('Category')
        $('select#category').val('')
        
        var images = $('.images .img')
        for(var i = 0; i < images.length; i++) {
          $(images)[i].remove()
        }
        
        var topic = $('#topic').val('')
        var message = $('#msg').val('')
      }
    })
  })(jQuery)