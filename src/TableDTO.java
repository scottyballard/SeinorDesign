import java.util.ArrayList;

import com.google.gson.Gson;


public class TableDTO {
	private ArrayList<Data> data;
	private transient TimeInterval time;
	private String metric;
	private double maxY;
	private transient String dataSet;
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
	String getDTOJson()
	{
		Gson gson=new Gson();
		return gson.toJson(this);
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
		return metric;
	}
	public void setTableName(String tableName) {
		this.metric = tableName;
	}
	public ArrayList<Data> getData() {
		return data;
	}
	public String getDataSet() {
		return dataSet;
	}
	public void setDataSet(String dataSet) {
		this.dataSet = dataSet;
	}

}