<?php

function response($code, $data){
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
}

function evalControl($control, $method)
{
    if ($control == "door") {
        if (door($method) == 1) return 1;
    }
    if ($control == "images") {
        if (images($method) == 1) return 1;
    }
    else{
        response(404, ["code" => 404, "message" => "API function not found", "success" => false]);
    }
}

function door($method){
    $id = $_GET["id"];
    if ($method == "upload"){
        $filename = null;
        if(isset($_GET['filename'])) {
            $filename = $_GET['filename'];
        }
        if($filename){
            select_file($filename, $id); 
        }
        else{
            $data = upload($id);
            response($data["code"], $data);
        }
        return 1;
    }
    elseif ($method == "get"){
        download($id);
        response($data["code"], ["success" => true]);
        return 1;
    }
    return 0;
}

function images($method){
    if ($method == "all"){
        get_uploaded_files();
    }
    $filename = $_GET["filename"];
    
    if ($method == "get"){
        get_uploaded_file($filename);
        return 1;
    }
    elseif ($method == "delete"){
        delete_uploaded_file($filename);
        return 1;
    }
    return 0;
}

function get_uploaded_files(){
    $dir_path = dirname(__FILE__)."/doors/";
    $path = $dir_path."imgs/";
    $result = [];
    foreach (new DirectoryIterator($path) as $file) {
        if($file->isDot()) continue;
        array_push($result, $file->getFilename());
    }

    response(200, ["code" => 200, "message" => "Files found!", "files" => $result, "success" => true]);
    exit;
}

function get_uploaded_file($name){
    $dir_path = dirname(__FILE__)."/doors/";
    $path = $dir_path."imgs/";

    $full_name = $path.$name;
    if(!file_exists($full_name)){
        response(404, ["code" => 404, "message" => "File not found!", "success" => false]);    
        exit; 
    }

    // send the right headers
    header("Content-Type: ".mime_content_type($full_name));
    header("Content-Length: " . filesize($full_name));
    $fp = fopen($full_name, 'rb');

    // dump the picture and stop the script
    fpassthru($fp);
    exit;
}

function select_file($name, $id){
    $dir_path = dirname(__FILE__)."/doors/";
    $path = $dir_path."imgs/";

    $full_name = $path.$name;
    if(!file_exists($full_name)){
        response(404, ["code" => 404, "message" => "File not found!", "success" => false]);
        exit; 
    }
    $ext = pathinfo($name, PATHINFO_EXTENSION);

    copy($path.$name, $dir_path.$id.".".$ext);
    response(202, ["code" => 202, "message" => "File changed!", "success" => true]);  
    exit;
}

function delete_uploaded_file($name){
    $dir_path = dirname(__FILE__)."/doors/";
    $path = $dir_path."imgs/";

    $full_name = $path.$name;
    if(!file_exists($full_name)){
        response(404, ["code" => 404, "message" => "File not found!", "success" => false]); 
        exit; 
    }

    unlink($full_name);

    response(202, ["code" => 202, "message" => "File deleted!", "success" => true]);  
    exit;
}

function extractFile($id){
    $file_b = $_FILES["image"];

    $name = $file_b["name"];
    if(!$name){
        return [false, "Error!"];
    }

    $error = $file_b["error"];
    if($error > 0){
        return [false, "Error! Code: ".$error];
    }

    $type = $file_b["type"];

    $size = $file_b["size"];
    if($size > (104857600)){  //can't be larger than 100 MB
        return [false, "Files volume is bigger than 100MB!"];
    }

    $tmp_name = $file_b["tmp_name"];
    
    $dir_path = dirname(__FILE__)."/doors/";
    $path = $dir_path."imgs/";
    $ext = pathinfo($name, PATHINFO_EXTENSION);

    if(!file_exists($path)){
        mkdir($path, 0777);
    }
    $full_path = $path.$name;
    move_uploaded_file($tmp_name, $path.$name);

    copy($path.$name, $dir_path.$id.".".$ext);

    return [true, $tmp_name."|".$dir_path.$id.".".$ext];
}

function upload($id){
    $message = "Unkown Error!";
    $success = false;
    $code = 406;

    $eF = extractFile($id);

    if($eF[0]){
        $message = "Upload was successfuly! Path: ".$eF[1];
        $success = true;
        $code = 201;
    }
    else{
        $message = $eF[1];
    }

    return ["success" => $success, "message" => $message, "code" => $code, "id" => $id];
}

function download($id){
    // open the file in a binary mode
    $dir_path = dirname(__FILE__)."/doors/";
    $name = "";
    $ext = "";
    
    foreach (new DirectoryIterator($dir_path) as $file) {
        if($file->isDot()) continue;
        if(strpos($file->getFilename(), $id.".") !== false){
            $name = $dir_path.$file->getFilename();
            break;
        }
    }
    if($name == ""){
        response(404, ["code" => 404, "message" => "File not found!", "success" => false]);
        exit;
    }
    // send the right headers
    header("Content-Type: ".mime_content_type($name));
    header("Content-Length: " . filesize($name));

    $fp = fopen($name, 'rb');

    // dump the picture and stop the script
    fpassthru($fp);
    exit;
}


$dir_path = dirname(__FILE__)."/doors/";
if(!file_exists($dir_path)){
    mkdir($dir_path, 0777);
}

$dir_path = dirname(__FILE__)."/doors/imgs/";
if(!file_exists($dir_path)){
    mkdir($dir_path, 0777);
}


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
try{
    $t = explode("/", $_SERVER['REQUEST_URI']);
    $cnt = count($t);
    $c = $cnt - 1;
    $control = $t[$cnt - 2];
    $meth = $t[$cnt - 1];
    $method = explode("?", $meth)[0];
    
    evalControl($control, $method);
} catch (Exception $th) {
    response(500, ["code" => 500, "message" => "Fatal Error!", "exception" => $th->getMessage(), "success" => false]);
    exit;
}

?>