<?php

function evalControl($control, $method)
{
    if ($control == "door") {
        if (door($method) == 1) return 1;
    }

    //http_response_code(404);
}

function door($method){
    $id = $_GET["id"];
    if ($method == "upload"){
        upload($id);
        return 1;
    }
    elseif ($method == "get"){
        download($id);
        return 1;
    }
    return 0;
}

function upload($id){
    if($_FILES['image']['name'])
    {
        //if no errors...
        if(!$_FILES['image']['error'])
        {
            $valid_file = true;
            //now is the time to modify the future file name and validate the file
            if($_FILES['image']['size'] > (104857600)) //can't be larger than 100 MB
            {
                $valid_file = false;
                $message = 'Oops!  Your file\'s size is to large.';
            }
            
            //if the file has passed the test
            if($valid_file == true)
            {
                //move it to where we want it to be
                move_uploaded_file($_FILES['image']['tmp_name'], dirname(__FILE__)."/doors/".$id.".jpg");
                $message = 'Congratulations!  Your file was accepted.';
            }
        }
        //if there is an error...
        else
        {
            //set that to be the returned message
            $message = 'Ooops!  Your upload triggered the following error:  '.$_FILES['image']['error'];
        }
    }
}

function download($id){
    // open the file in a binary mode
    $name = dirname(__FILE__)."/doors/".$id.'.jpg';
    $fp = fopen($name, 'rb');

    // send the right headers
    header("Content-Type: image/jpeg");
    header("Content-Length: " . filesize($name));

    // dump the picture and stop the script
    fpassthru($fp);
    exit;
}

$t = explode("/", $_SERVER['REQUEST_URI']);
$cnt = count($t);
$c = $cnt - 1;
$control = $t[$cnt - 2];
$meth = $t[$cnt - 1];
$method = explode("?", $meth)[0];

evalControl($control, $method);
?>