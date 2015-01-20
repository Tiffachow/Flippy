<!DOCTYPE html>
<html>

    <head>
      <title>Flippy</title>
      <meta charset="utf-8" />
    </head>
    
    <body>
        <?php 
        
            $host = "localhost";
            $user = "root";
            $pass = "scoresdatabase";
            
            $databaseName = "scores";
            $tableName = "scores";
            
            // Connect to mysql database
            $con = mysqli_connect($host,$user,$pass);
            
            if (mysqli_connect_errno())
            {
                echo "Failed to connect to MySQL: " . mysqli_connect_error();
            }
            
            // Select database to work with
            $dbs = mysql_select_db($databaseName, $con);
        
            //  Add data from form and client to database
            $sql = "INSERT INTO scores (id, alias, scores_min, scores_sec, scores_ms) VALUES ('NULL','$_POST [alias]','$_POST [timer.minElapsed]','$_POST [timer.secCounter]', '$_POST [timer.msCounter]')";
            
            if (!mysql_query($con, $sql)) {
                die ('Error: ' . mysql_error($con));
            }
            else {  
                echo "1 record added";
            }
            
            // Close the connection
            mysql_close($con);
        ?>
    </body>
</html>