
import java.util.ArrayList;

import com.google.gson.Gson;


public class DataController {
    static Database db = new Database("root","","jdbc:mysql://localhost:3306/new_schema");
    static boolean refreshAll()
    {
    	boolean result=false;
        ArrayList<String> series = db.getAllSeries();
        ArrayList<String> tableNames = db.getAllTableNames();
        for(int i = 0;i<series.size();i++){
            TableDTO item = new TableDTO();
            item.setData(GetBLSData.getData(series.get(i)));
            item.setTableName(tableNames.get(i));
            result=db.singleRefresh(item);
        }
        return result;
    }
    static boolean singleRefresh(String tableName){
        TableDTO item = new TableDTO();
        item.setData(GetBLSData.getData(db.getSeriesID(tableName)));
        item.setTableName(tableName);
        return db.singleRefresh(item);
    }
    static String getTable(String tableName)
    {
    	TableDTO table = db.getData(tableName);
    	return table.getDTOJson();
    }
    static String getGroup(String group)
    {
    	ArrayList<String> tableList = db.getSeriesGroup(group);
    	ArrayList<TableDTO> tables = new ArrayList<TableDTO>();
    	for(String tableName : tableList)
    	{
    		tables.add(db.getData(tableName));
    	}
    	Gson gson = new Gson();
    	return gson.toJson(tables.toArray());
    }
    static void addAll()
    {
        ArrayList<String> series = db.getAllSeries();
        ArrayList<String> tableNames = db.getAllTableNames();
        for(int i = 0;i<series.size();i++){
            TableDTO item = new TableDTO();
            item.setData(GetBLSData.getData(series.get(i)));
            item.setTableName(tableNames.get(i));
            db.createRow(item);
        }
    }
    
    public static void main(String [] args)
    {
    	//System.out.println(new File(".").getAbsoluteFile());
    	//refreshAll();
    	//addAll(); 
    	//System.out.println(db.getSeriesGroup("Emp").get(0));
    	//db.getSeriesGroup("Emp");
    }
}
