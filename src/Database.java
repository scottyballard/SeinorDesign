import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.*;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
;
public class Database {

	Connection conn = null;
	Statement stmt = null;
	ResultSet rs;
	Database(String user, String pass, String dbURL)
	{
		try {
		    Class.forName("com.mysql.jdbc.Driver");
		    conn = DriverManager.getConnection(dbURL,user,pass);
		    stmt= conn.createStatement();
		    //System.out.println("Driver loaded!");
		} catch (ClassNotFoundException e) {
			System.out.println("Cannot find the driver in the classpath!");
		}
		catch (SQLException e) {
			System.out.println("Error connecting to the mysql database!"+e);
		}
		//createTable();	
	}
	boolean singleRefresh(TableDTO table)
	{
		try {
			stmt.execute("UPDATE Application_Data SET TableData='"+table.getDataJson()+"' WHERE TableName='"+table.getTableName()+"';");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
		
	}
	boolean deleteData(TableDTO table)
	{
		try {
			stmt.execute("DELETE FROM Application_Data WHERE TableName='"+table.getTableName()+"';");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false; 
		}
		return true;
		
	}
	@SuppressWarnings("unchecked")
	TableDTO getData(String tableName)
	{
		TableDTO result=new TableDTO();
		try {
			rs=stmt.executeQuery("SELECT * FROM Application_Data WHERE TableName='"+tableName+"';");
            rs.next();
			String getData=rs.getString(2);
                        //System.out.println(getData);
			Gson gson= new Gson();
			result.setTableName(tableName);
			result.setTime(TimeInterval.valueOf(rs.getString(3)));
			result.setData((ArrayList<Data>) gson.fromJson(getData, new TypeToken<ArrayList<Data>>(){}.getType()));
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		return result;
	}
        boolean createRow(TableDTO table)
	{
		try {
			stmt.execute("INSERT into Application_Data VALUES('"+table.getTableName()+"', '"+table.getDataJson()+"', '"+table.getTime().toString()+"');");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
		
	}
        
        String getTableName(String tableName){
            String getData=new String();
            
            try {
                rs=stmt.executeQuery("SELECT * FROM series_mapping WHERE TableName='"+tableName+"';");
                rs.next();
		getData=rs.getString(2);
                return getData;
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
        }
        ArrayList<String> getAllTableNames(){
           
            ArrayList<String> result= new ArrayList<>();
            try {
                rs=stmt.executeQuery("SELECT * FROM series_mapping;");
                while(rs.next()){
                    result.add(rs.getString(1));
                }
                return result;
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
            
        }
        String getSeriesID(String tableName){
            String getData=new String();
            
            try {
                rs=stmt.executeQuery("SELECT * FROM series_mapping WHERE TableName='"+tableName+"';");
                rs.next();
		getData=rs.getString(2);
                return getData;
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
        }
        
        
        ArrayList<String> getAllSeries(){
           
            ArrayList<String> result= new ArrayList<>();
            try {
                rs=stmt.executeQuery("SELECT * FROM series_mapping;");
                while(rs.next()){
                    result.add(rs.getString(2));
                }
                return result;
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
            
        }
        ArrayList<String> getSeriesGroup(String group){
            
            ArrayList<String> result= new ArrayList<>();
            try {
                rs=stmt.executeQuery("SELECT * FROM series_mapping WHERE GroupName = '"+group+"';");
                while(rs.next()){
                    result.add(rs.getString(1));
                }
                return result;
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
            
        }
        
        boolean addSeries(String tableName, String seriesID){
            try {
			stmt.execute("INSERT into series_mapping VALUES('"+tableName+"', '"+seriesID+"');");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
        }
        
        boolean deleteSeries(String tableName){
            try {
                stmt.execute("DELETE FROM series_mapping WHERE TableName='"+tableName+"';");
            } catch (SQLException ex) {
                Logger.getLogger(Database.class.getName()).log(Level.SEVERE, null, ex);
                return false;
            }
            return true;
        }
        void createTable()
        {
        	try {
				stmt.execute("CREATE TABLE application_data (TableName varchar(100) primary key, TableData JSON, TimePeriod varchar(10));");
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				//e.printStackTrace();
			}
			try {
				stmt.execute("CREATE TABLE series_mapping (TableName varchar(100) primary key, SeriesName varchar(30), GroupName varchar(20));");
				
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				//e.printStackTrace();
			}
			try {
				BufferedReader reader = new BufferedReader(new FileReader(new File("").getAbsoluteFile()+"\\src\\seriesmapping.txt"));
				String line;
				while((line = reader.readLine())!=null)
				{
					String [] mapping = line.split(",");
					stmt.execute("INSERT INTO series_mapping VALUES('"+mapping[0]+"', '"+mapping[1]+"', '"+mapping[2]+"');");
				}
				reader.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				//e.printStackTrace();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				//e.printStackTrace();
			}
			

        }

        
}
