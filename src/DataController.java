
import java.io.File;
import java.util.ArrayList;


public class DataController {
    static Database db = new Database("root","","jdbc:mysql://97.77.48.250:3306/new_schema");
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
    	return table.getDataJson();
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
    /*
    public static void main(String [] args)
    {
    	//System.out.println(new File(".").getAbsoluteFile());
    	addAll(); 
    }*/
}
