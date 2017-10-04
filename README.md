# userfrosting-sprinkles

### Description
This is a very small file browser aimed to be integrated in your project. Right
now this example is built on top of Userfrosting. This README will show
the important files.

### Features
 - Browse directories
 - Open files
 - Edit files (ckeditor)
 - Move / rename files and folders
 - Remove files and empty folders
 - Create a new folder
 - Create an empty file
 - Upload multiple files at once (HTML5)

### Important Files
 - `assets/js/FileManager.php` server side logic
  - `assets/js/editor.js` client side editor stuff
 - `templates/pages/filemanager.html.twig` HTML template
 - `src/Controller/FilemanagerController.php` The Controller
 - `routes/filemanager.php` client side editor stuff

### Installation

Copy the sprinkles in your sprinkles folder (normally app/sprinkles).
Add the "fileManager" line in your sprinkles.json.

To add the Filemanager on the menu, don't hesitate to add this code in your first sprinkles templates/navigation/sidebar-menu.html.twig
```
{% extends "@admin/navigation/sidebar-menu.html.twig" %}

{% block navigation %}
    
    {{ parent() }}
    
    <li>
        <a href="{{site.uri.public}}/filemanager"><i class="fa fa-rocket fa-fw"></i> <span>File Manager</span></a>
    </li>
{% endblock %}
```

### Working
- /filemanager/ajax/test : Show the file(have to be modify to show images also for exemple)
- /filemanager/ajax/page
- /filemanager/browse/test
- /filemanager/browse/page

### Not Working (to continue)

- /filemanager/ : Must debug the route with the correct path in
- Make a new folder for each group
- Add Authorisation for group admin to add/delete/create ...
- add Authorisation for user to access folder/file


### Used Components
 - [CKEditor](http://ckeditor.com/)
 - [Font Awesome](http://fortawesome.github.com/Font-Awesome/)


### License

    Copyright (c) 2017 Renaud Devaliere

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
