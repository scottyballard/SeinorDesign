import java.util.ArrayList;

import com.google.gson.Gson;


public class TableDTO {
	private ArrayList<Data> data;
	private TimeInterval time;
	private String tableName;
	private double maxY;
        TableDTO()
        {
            data = new ArrayList<Data>();
            time=TimeInterval.MONTHLY;
            maxY=0;
        }
	String getDataJson(){
		Gson gson=new Gson();
		return gson.toJson(data);
	}
	public void setData(ArrayList<Data> data)
	{
		this.data=data;
		for(int i=0;i<data.size();i++){
			if(data.get(i).getValue()>maxY){
				maxY=data.get(i).getValue();
			}
		}
		
	}
	public TimeInterval getTime() {
		return time;
	}
	public void setTime(TimeInterval time) {
		this.time = time;
	}
	public String getTableName() {
		return tableName;
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}
	public ArrayList<Data> getData() {
		return data;
	}

}