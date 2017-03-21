
import java.util.ArrayList;


public class DataController {
    static Database db = new Database("admin","password","jdbc:mysql://127.0.0.1:3310/new_schema");
    static GetBLSData bls = new GetBLSData();
    static void refreshAll()
    {
        ArrayList<String> series = db.getAllSeries();
        ArrayList<String> tableNames = db.getAllTableNames();
        for(int i = 0;i<series.size();i++){
            TableDTO item = new TableDTO();
            item.setData(bls.getData(series.get(i)));
            item.setTableName(tableNames.get(i));
            db.singleRefresh(item);
        }
    }
    static void singleRefresh(String tableName){
        TableDTO item = new TableDTO();
        item.setData(bls.getData(db.getSeriesID(tableName)));
        item.setTableName(tableName);
        db.singleRefresh(item);
    }
}
