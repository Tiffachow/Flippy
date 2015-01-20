<!DOCTYPE html>
<html>

    <head>
      <title>Flippy</title>
      <meta charset="utf-8" />
    </head>
    
    <body>
        <?php 
            //--------------------------------------------------------------------------
            // Example php script for fetching data from mysql database
            //--------------------------------------------------------------------------
            $host = "localhost";
            $user = "root";
            $pass = "scoresdatabase";
            
            $databaseName = "scores";
            $tableName = "scores";
            
            //--------------------------------------------------------------------------
            // 1) Connect to mysql database
            //--------------------------------------------------------------------------
            $con = mysql_connect($host,$user,$pass);
            if (mysqli_connect_errno())
            {
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
            }
            $dbs = mysql_select_db($databaseName, $con);
            
            //--------------------------------------------------------------------------
            // 2) Query database for data
            //--------------------------------------------------------------------------
            $result = mysql_query("SELECT * FROM $tableName ORDER BY scores_min DESC, scores_sec DESC, scores_ms DESC LIMIT 500"); //query
            $array = mysql_fetch_row($result); //fetch result    
            
            //--------------------------------------------------------------------------
            // 3) echo result as json 
            //--------------------------------------------------------------------------
            echo json_encode($array);
            
            mysql_close($con);
        ?>
    </body>
</html>