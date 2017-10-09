// -------------------------------------------------- MESSAGE BOX
/**
 * add a message to the message box. context and type can be omitted.
 */
 
function add_msg(msg, context, type) {
    context = typeof context !== 'undefined' ? context : 'Info';
	type = typeof type !== 'undefined' ? type : 'alert-info';

	$('div#msgbox').prepend(
    	$('<div />').addClass('alert').addClass(type).append(
			'<a class="close" data-dismiss="alert">&times;</a>',
			'<strong>' + context + ':</strong> ' + msg
		)
	);
}

// -------------------------------------------------- BROWSE
/**
 * set breadcrumb according to PATH.
 */
 
function set_breadcrumb() {
  // clear
  	$('ol#breadcrumb').html('<li><a href="">data</a></li>');

  	// add parts
  	var parts = PATH.split('/');
  	var html = '';
  	var link = '';
  	for (var i = 0; i < parts.length; i++) {
	  	if (i != parts.length - 1) {
  	    	link += i == 0 ? parts[i] : '/' + parts[i];
  			html += '<li><a href="' + link + '">' + parts[i] + '</a></li>';
  		}
  		else {
  			html += '<li class="active">' + parts[i] + '</li>';
    	}
  	}
  	$('ol#breadcrumb').append(html);

  	// register click event
  	$('ol#breadcrumb a').click(function (e) {
    	e.preventDefault();
		browse($(e.target).attr('href'));
	});
}

/**
 * do the ajax request for the new path.
 */
 
function browse(path) {
	$.ajax({
    	url: 'filemanager/ajax/' + path,
		cache: false,
		dataType: 'json',
		success: function (result) {
		if (result.status)
        	show_content(path, result.files);
			else
			add_msg(result.msg, 'PHP', 'alert-danger');
    	},
		error: function (jqXHR, status) {
			add_msg(status, 'AJAX', 'alert-danger');
    	}
  	});
}

/**
 * ajax success callback, set path and add content to table.
 */
 
function show_content(path, files) {
	PATH = path;
	set_breadcrumb();

	$('table#filemanager').empty();

	for (var i = 0; i < files.length; i++) {
    	var f = files[i];

		if (f.folder) {
			f.icon = 'fa fa-folder';
			f.name = $('<a />').attr('href', f.link).text(f.name).click(function (e) {
				e.preventDefault();
				browse($(e.target).attr('href'));
      		});
	  		f.edit = '';
    	}
    	else {
			file_icon(f);
			if(f.icon == 'fa fa-file-archive-o')
				f.name = '<a href="filemanager/browse/' + f.link + '" download="' + f.link + '">' + f.name + '</a>';      
			else
				f.name = '<a href="filemanager/browse/' + f.link + '"  class="gallery" title="' + f.link + '">' + f.name + '</a>';      
			f.edit = $('<a />').attr('href', f.link).html('<i class="fa fa-edit"></i>').click(function (e) {
				e.preventDefault();
		        $.ajax({
		          url: 'filemanager/ajax/' + $(e.target).parent().attr('href'),
		          cache: false,
		          dataType: 'text',
		          success: function (result) {
			          $('div#editor textarea').val(result);
					  $('div#editor input#editor-target').val($(e.target).parent().attr('href'));
					  $('div#editor').show();
		          },
		          error: function (jqXHR, status) {
			          add_msg(status, 'AJAX', 'alert-danger');
		          }
		        });
	      });;
	    }

		// move action
		f.move = $('<a />').attr('href', f.link).html('<i class="fa fa-arrow-right"></i>').click(function (e) {
			e.preventDefault();

			$('div#move input#move-src').val($(e.target).parent().attr('href'));
			$('div#move input#move-dst').val(PATH == '' ? '' : (PATH + '/'));
			$('div#move').modal('show');
    	});

		// remove action
		f.remove = $('<a />').attr('href', f.link).html('<i class="fa fa-remove"></i>').click(function (e) {
			e.preventDefault();
			$('div#remove input#remove-path').val($(e.target).parent().attr('href'));
			$('div#remove').modal('show');
    	});

		$('table#filemanager').append(
			$('<tr />').append(
				$('<td />').append('<i class="' + f.icon + '"></i> ', f.name),
				$('<td />').text(f.size),
				$('<td />').text(f.date),
				$('<td />').text(f.perm),
				$('<td style="text-align:right">').append(f.edit, ' ', f.move, ' ', f.remove)
			)
		);
  	}
  	$.colorbox.settings.opacity = 0.7;
    $('a.gallery').colorbox();
}

function file_icon(f) {
	dot = f.link.lastIndexOf("."); 
    extension = f.link.substr(dot,f.link.length); 
    
    if($.inArray(extension,['.jpg','.jpeg','.png','.gif','.bmp','.apng','.tif','.tiff']) !== -1)
    	f.icon = 'fa fa-file-image-o';
    else if($.inArray(extension,['.zip','.rar','.7z','.tar','.gz','.bz2','.tgz']) !== -1)
      	f.icon = 'fa fa-file-archive-o';
    else if(extension == '.txt')
      	f.icon = 'fa fa-file-text-o';
    else if($.inArray(extension,['.php','.phtml','.php3','.php4','.php5','.phps','.htm','.html','.shtml','.xhtml']) !== -1)
      	f.icon = 'fa fa-file-code-o';
    else if($.inArray(extension,['.mp3','.flac','.aac','.m4a','.m3u','.pls','.mpga','.ogg']) !== -1)
      	f.icon = 'fa fa-file-audio-o';
    else if(extension == '.doc' || extension == '.docx')
      	f.icon = 'fa fa-file-word-o';
    else if(extension == '.xls' || extension == '.xlsx')
      	f.icon = 'fa fa-file-excel-o';
    else if(extension == '.pdf')
      	f.icon = 'fa fa-file-pdf-o';
    else if($.inArray(extension,['.avi','.mov','.mp4','.wmv','.mkv','.vob','.mpg']) !== -1)
     	 f.icon = 'fa fa-file-movie-o';
    else if(extension == '.pptx' || extension == '.ppt')
      	f.icon = 'fa fa-file-powerpoint-o';
    else
     	 f.icon = 'fa fa-file-o';
}

// -------------------------------------------------- PROGRESS BAR
/**
 * callback function for progress bar.
 */
 
function progress_bar(e) {
  	var done = e.position || e.loaded;
  	var total = e.totalSize || e.total;
  	var per = (Math.floor(done / total * 1000) / 10);
  	$('div#progress > div.bar').css('width', per + '%').text(per + ' %');
}

// -------------------------------------------------- MODAL SUBMIT

$('div#new a.submit').click(function (e) {
	var data = {
        'type': $('div#new input#new-type').val()
    };
    data[site.csrf.keys.name] = site.csrf.name;
    data[site.csrf.keys.value] = site.csrf.value;
	
	$.ajax({
    	url: 'filemanager/ajax/' + $('div#new input#new-path').val(),
		cache: false,
		dataType: 'json',
		data: data,
		type: 'POST',
		success: function (result) {
			add_msg(result.msg, 'PHP', result.status ? 'alert-success' : 'alert-danger');
			browse(PATH);
    	},
		error: function (jqXHR, status) {
			add_msg(status, 'AJAX', 'alert-danger');
    	}
  	});
});

$('div#remove a.submit').click(function (e) {
	var data = {
        'type': "DELETE"
    };
    data[site.csrf.keys.name] = site.csrf.name;
    data[site.csrf.keys.value] = site.csrf.value;
    
	$.ajax({
    	url: 'filemanager/ajax/' + $('div#remove input#remove-path').val(),
		cache: false,
		dataType: 'json',
		data:data,
		type: 'DELETE',
		success: function (result) {
			add_msg(result.msg, 'PHP', result.status ? 'alert-success' : 'alert-danger');
			browse(PATH);
    	},
		error: function (jqXHR, status) {
			add_msg(status, 'AJAX', 'alert-danger');
    	}
  	});
});

$('div#move a.submit').click(function (e) {
	var data = {
		'type': 'move',
		'src': $('div#move input#move-src').val(),
		'dst': $('div#move input#move-dst').val()
    };
    data[site.csrf.keys.name] = site.csrf.name;
    data[site.csrf.keys.value] = site.csrf.value;
    
	$.ajax({
    	url: 'filemanager/ajax/',
		cache: false,
		dataType: 'json',
		data: data,
		type: 'POST',
		success: function (result) {
			add_msg(result.msg, 'PHP', result.status ? 'alert-success' : 'alert-danger');
			browse(PATH);
    	},
		error: function (jqXHR, status) {
			add_msg(status, 'AJAX', 'alert-danger');
    	}
  	});
});

$('div#upload a.submit').click(function (e) {
  	$.ajax({
    	url: 'filemanager/ajax/' + $('div#upload input#upload-path').val(),
		cache: false,
		contentType: false,
		processData: false,
		dataType: 'json',
		data: new FormData($('div#upload form')[0]),
		type: 'POST',
		success: function (result) {
			$('div#progress').hide();
			add_msg(result.msg, 'PHP', result.status ? 'alert-success' : 'alert-danger');
			browse(PATH);
    	},
		error: function (jqXHR, status) {
			$('div#progress').hide();
			add_msg(status, 'AJAX', 'alert-danger');
    	},
		xhr: function() {
			var x = $.ajaxSettings.xhr();
			if (x.upload)
				x.upload.addEventListener('progress', progress_bar, false);
			return x;
    	}
	});

	$('div#progress div.bar').css('width', 0);
	$('div#progress').show();
});

// -------------------------------------------------- TOOLBOX BUTTONS
$('div#tools a#upload-button').click(function (e) {
  	e.preventDefault();
  	$('div#upload input#upload-path').val((PATH == '' ? '' : (PATH + '/')));
  	$('div#upload').modal('show');
});

$('div#tools a#new-file-button').click(function (e) {
  	e.preventDefault();
  	$('div#new input#new-type').val('file');
  	$('div#new input#new-path').val(PATH == '' ? '' : (PATH + '/'));
  	$('div#new').modal('show');
});

$('div#tools a#new-folder-button').click(function (e) {
  	e.preventDefault();
  	$('div#new input#new-type').val('folder');
  	$('div#new input#new-path').val(PATH == '' ? '' : (PATH + '/'));
  	$('div#new').modal('show');
});

$('div#tools a#refresh-button').click(function (e) {
  	browse(PATH);
});

$('div#tools a#clear-msgbox-button').click(function (e) {
  	$('div#msgbox').empty();
});



        