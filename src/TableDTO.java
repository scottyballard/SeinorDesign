import java.util.ArrayList;

import com.google.gson.Gson;


public class TableDTO {
	private ArrayList<Double> data;
	private TimeInterval time;
	private String tableName;
	
	String getDataJson(){
		Gson gson=new Gson();
		return gson.toJson(data.toArray());
	}
	public void setData(ArrayList<Double> data)
	{
		this.data=data;
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
	public ArrayList<Double> getData() {
		return data;
	}
	
}
