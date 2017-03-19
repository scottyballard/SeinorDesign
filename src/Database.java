import java.io.IOException;
import java.sql.*;

import com.google.gson.*;;
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
			System.out.println("Error connecting to the mysql database!");
		}
		
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
			stmt.execute("DELETE FROM Application_Data WHERE TableName='"+table.getTableName()+"'");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false; 
		}
		return true;
		
	}
	TableDTO getData(String tableName)
	{
		TableDTO result=new TableDTO();
		try {
			rs=stmt.executeQuery("SELECT TableName, TimeInterval, TableData FROM Application_Data WHERE TableName='"+tableName+"';");
			String getData=rs.getString(3);
			Gson gson= new Gson();
			result.setTableName(tableName);
			result.setTime(TimeInterval.valueOf(rs.getString(2)));
			result.setData(gson.fromJson(getData, result.getData().getClass()));
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		return result;
	}
}
