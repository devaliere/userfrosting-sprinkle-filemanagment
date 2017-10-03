<?php
/**
 * UserFrosting (http://www.userfrosting.com)
 *
 * @link      https://github.com/userfrosting/UserFrosting
 * @license   https://github.com/userfrosting/UserFrosting/blob/master/licenses/UserFrosting.md (MIT License)
 */

/**
 * Routes for filemanager related pages..
 */
 
 use UserFrosting\Sprinkle\FileManager\Controller\FilemanagerController as FilemanagerController;
 
 
$app->group('/filemanager', function () {
	

    $this->get('', 'UserFrosting\Sprinkle\FileManager\Controller\FilemanagerController:browse')
        ->setName('filemanager');


    $this->get('/browse[/{path}]', 'UserFrosting\Sprinkle\FileManager\Controller\FilemanagerController:browse')
        ->setName('browse');
        

	$this->get('/ajax[/{path}]', function($request, $response) {
    	$path = $request->getAttribute('path');
    	$target = __DIR__.'/../data/'.$path;

		if (!file_exists($target))
        	return $response->write(FilemanagerController::msg(False, "$target does not exist"));

		if (is_dir($target))
			return $response->write(FilemanagerController::get_content($app, $path));
		else
        	return $response->write(file_get_contents($target));
	});
	
	$this->post('/ajax[/{path}]', function($request, $response) {		
        if ($_POST['type'] == 'folder')
            return $response->write(FilemanagerController::create_folder($path));
        else if ($_POST['type'] == 'file')
            return $response->write(FilemanagerController::create_file($path));
        else if ($_POST['type'] == 'move')
            return $response->write(FilemanagerController::move($_POST['src'], $_POST['dst']));
        else if ($_POST['type'] == 'upload')
            return $response->write(FilemanagerController::upload($path));
        else if ($_POST['type'] == 'edit')
            return $response->write(FilemanagerController::save($path, $_POST['content']));
        else
            return $response->write(FilemanagerController::msg(False, 'unknown type'));
    });


    $this->delete('/ajax/{path}', function($request, $response) {
	    $path = $request->getAttribute('path');
         return $response->write(FilemanagerController::remove($path));
    });


})->add('authGuard');

