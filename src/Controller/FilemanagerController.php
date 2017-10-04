<?php

namespace UserFrosting\Sprinkle\Filemanager\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\NotFoundException;
use UserFrosting\Sprinkle\Core\Controller\SimpleController;
use UserFrosting\Support\Exception\ForbiddenException;

use UserFrosting\Sprinkle\FileManager\Database\Models\FileManager;
use UserFrosting\Sprinkle\Core\Facades\Debug;


class FilemanagerController extends SimpleController
{   
    /**
     * returns a json message ether successful or failure.
     */
    public static function msg($status, $msg)
    {
        return json_encode(array(
            'status' => $status,
            'msg' => $msg
        ));
    }

    /**
     * returns the filemanager template with the given path set. if the path
     * relates to a file, the file is send to the client instead.
     */
    public function browse(Request $request, Response $response, $args) {
	    
	    $path = $request->getAttribute('path');
        $target = __DIR__.'/../../data/'. $path;
        // list files et renvoie vers displayPage (ERROR)
		if (is_dir($target)) {
        	return $this->ci->view->render($response, 'pages/filemanager.html.twig', [
				'path' => $args->path
			]);
		}
        // check file and show it (have to find the slim function for it (images and so ....)
        if (file_exists($target)) {
	        return self::readfile($target);
	    }
         //  
        else {
        // error
        	return self::msg(False, $target.' does not exist');
        }
    }
    
    
    /**
     * Takes a given path and prints the content in json format.
     */
    public static function get_content($app, $path)
    {
        $path = __DIR__.'/../../data/'.$path;
        $path = rtrim($path, '/');

        require_once __DIR__.'/helper.php';

        // get dir content
        $files = array();
        $folders = array();
        list_dir($path, $files, $folders);
        $files = array_merge($folders, $files);

        // get info
        foreach ($files as $k => $v) {
            $i = get_file_info($v['path'], array(
                'name',
                'size',
                'date',
                'fileperms'
            ));

            if ($v['folder']) {
                $files[$k] = array (
                    'name' => $i['name'],
                    'size' => '---',
                    'date' => date('Y-m-d H:i:s', $i['date']),
                    'perm' => unix_perm_string($i['fileperms']),
                    'folder' => True
                );
            } else {
                $files[$k] = array(
                    'name' => $i['name'],
                    'size' => human_filesize($i['size']),
                    'date' => date('Y-m-d H:i:s', $i['date']),
                    'perm' => unix_perm_string($i['fileperms']),
                    'folder' => False
                );
            }

            $files[$k]['link'] = str_replace(__DIR__.'/../../data/', '', $v['path']);
        }

        return json_encode(array('status' => 'ok', 'files' => $files));
    }

    /**
     * creates a new folder and returns a message.
     */
    public static function create_folder($path)
    {
        $target = __DIR__.'/../../data/'.$path;

        if (is_dir($target))
            return self::msg(False, "folder $path already exists");

        if (!is_writable(pathinfo($target, PATHINFO_DIRNAME)))
            return self::msg(False, "target folder not writable");

        if (file_exists($target))
            return self::msg(False, "file $path already exists");

        if (!@mkdir($target))
            return self::msg(False, "could not create $path");

        return self::msg(True, "folder created");
    }

    /**
     * creates a new empty file and returns a message.
     */
    public static function create_file($path)
    {
        $target = __DIR__.'/../../data/'.$path;

        if (is_dir($target))
            return self::msg(False, "folder $path already exists");

        if (!is_writable(pathinfo($target, PATHINFO_DIRNAME)))
            return self::msg(False, "target folder not writable");

        if (file_exists($target))
            return self::msg(False, "file $path already exists");

        if (@file_put_contents($target, '') === false)
            return self::msg(False, "could not create $path");

        return self::msg(True, "empty file created");
    }

    /**
     * removes target and returns a message.
     */
    public static function remove($path)
    {
        $target = __DIR__.'/../../data/'.$path;

        if (!file_exists($target))
            return self::msg(False, "$path does not exist");

        if (!is_writable($target))
            return self::msg(False, "$path is not writable");

        if (is_dir($target))
            $res = @rmdir($target);
        else
            $res = @unlink($target);

        if ($res === False)
            return self::msg(False, "$path has not been removed");

        return self::msg(True, "$path has been removed");
    }

    /**
     * move target file from src to dst, returns a message.
     */
    public static function move($src, $dst)
    {
        $src = __DIR__.'/../../data/'.$src;
        $dst = __DIR__.'/../../data/'.$dst;

        if (!file_exists($src))
            return self::msg(False, 'source file / folder does not exist');

        if (file_exists($dst))
            return self::msg(False, 'destination file / folder already exists');

        if (!file_exists(pathinfo($dst, PATHINFO_DIRNAME)))
            return self::msg(False, 'destination path does not exist');

        if (!is_writable($src))
            return self::msg(False, 'source file / folder is not writable');

        if (!is_writable(pathinfo($dst, PATHINFO_DIRNAME)))
            return self::msg(False, 'destination path is not writable');

        if (!@rename($src, $dst))
            return self::msg(False, 'file / folder was not moved');

        return self::msg(True, 'moved file / folder');
    }

    /**
     * receive uploaded files and process them, return a message afterwards.
     */
    public static function upload($path)
    {
        $target = __DIR__.'/../../data/'.$path;

        // check for upload
        if (!isset($_FILES['files']['name'][0]))
            return self::msg(False, 'no files uploaded');

        // restructure
        $files = array();
        foreach ($_FILES['files']['name'] as $n => $v) {
            $files[$n] = array(
                'name'     => $_FILES['files']['name'][$n],
                'type'     => $_FILES['files']['type'][$n],
                'tmp_name' => $_FILES['files']['tmp_name'][$n],
                'error'    => $_FILES['files']['error'][$n],
                'size'     => $_FILES['files']['size'][$n]
            );
        }

        // check upload status
        foreach ($files as $f)
        {
            if ($f['error'] > 0)
                return self::msg(False, $f['name'].' not uploaded successfully');
        }

        // replace spaces
        foreach ($files as $n => $f)
        {
            $files[$n]['name'] = str_replace(' ', '-', $f['name']);
        }

        // skip already present files
        foreach ($files as $n => $f)
        {
            if (file_exists($target.'/'.$f['name']))
                unset($files[$n]);
        }

        // check if target folder is writable
        if (!is_writable($target))
            return self::msg(False, 'target path is not writable');

        // move files from tmp to target
        foreach ($files as $f)
        {
            if (!move_uploaded_file($f['tmp_name'], $target.'/'.$f['name']))
                return self::msg(False, $f['name'].' was not stored successfully');
        }

        return self::msg(True, 'files have been uploaded');
    }

    /**
     * save file contents and return a message.
     */
    public static function save($path, $content)
    {
        $target = __DIR__.'/../../data/'.$path;

        if (@file_put_contents($target, $content) === false)
            return self::msg(False, 'could not write file');

        return self::msg(True, 'file saved');
    }
    
    public static function readfile($target)
    {
     ob_clean();
			ob_end_clean();
			header('Content-Type: image/jpeg');
			readfile($target);
	}
}