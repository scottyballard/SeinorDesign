
import java.util.ArrayList;

import com.google.gson.Gson;


public class DataController {
    static Database db = new Database("alliance","labor","jdbc:mysql://localhost:3306/application_data");
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
    static boolean groupRefresh(String groupName){
    	ArrayList<String> tableList = db.getSeriesGroup(groupName);
    	boolean result = false;
        for(String tableName : tableList)
        {
            TableDTO item = new TableDTO();
            String series = db.getSeriesID(tableName);
            item.setData(GetBLSData.getData(series));
            item.setTableName(tableName);
            result = db.singleRefresh(item);
        }
        return result;
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
}
