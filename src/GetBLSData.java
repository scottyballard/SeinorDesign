import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

public class GetBLSData {
/**
 * Helper function to pull and parse data from the BLS website
 * 
 * @param seriesID - ID of the BLS series that is going to be parsed
 * @return an Array List of the data in the series as doubles 
 * <p>-1 is used to indicate any missing data from the default 2000-present timeline</p>
 * @throws IOException
 */
 public static ArrayList<Data> getData(String seriesID)
 {
	//Generate the post request used to retrieve the data
	int currentYear = Calendar.getInstance().get(Calendar.YEAR);
	String urlParameters="request_action=get_data&reformat=true&from_results_page=true&years_option=specific_years"
	+ "&delimiter=comma&output_type=multi&periods_option=all_periods&output_view=data&to_year="+Integer.toString(currentYear)
	+"&from_year=2000&output_format=text&original_output_type=default&annualAveragesRequested=false&series_id="+seriesID;
	  
	byte[] postData       = urlParameters.getBytes( StandardCharsets.UTF_8 );
	int    postDataLength = postData.length;
	String request        = "https://data.bls.gov/pdq/SurveyOutputServlet";
	URL    url;
     try {
         url = new URL( request );
     
	HttpURLConnection conn= (HttpURLConnection) url.openConnection();           
	conn.setDoOutput( true );
	conn.setInstanceFollowRedirects( false );
	conn.setRequestMethod( "POST" );
	conn.setRequestProperty( "Content-Type", "application/x-www-form-urlencoded"); 
	conn.setRequestProperty( "charset", "utf-8");
	conn.setRequestProperty( "Content-Length", Integer.toString( postDataLength ));
	conn.setUseCaches( false );
	DataOutputStream wr = new DataOutputStream( conn.getOutputStream()); 
	wr.write( postData );
	
	//Read in the response and parse the data
	BufferedReader is=new BufferedReader(new InputStreamReader(conn.getInputStream()));
	String inputLine;
	String[] resultSet = null;
	ArrayList<Double> data = new ArrayList<>();
	while ((inputLine = is.readLine()) != null)
	{
		//The data line starts with the series ID followed by a comma
		if(inputLine.contains(seriesID+","))
			resultSet=inputLine.split(",");
	}
	//
	for(String result : resultSet)
	{
		if(result.equals(seriesID))
			continue;
		if(result.contains("("))
			result = result.split("\\(")[0];
		if(result.equals("&nbsp;"))
			result = "-1";
		data.add(Double.parseDouble(result));
	}
	is.close();
	double currentDate = 2000;
	ArrayList<Data> dataList = new ArrayList<>();
	int counter = 0;
	for(double i : data)
	{
		if(i==-1)
		{
			if(seriesID.startsWith("CI"))
				currentDate+=1.0/4;
			else
				currentDate+=1.0/12;
			counter++;
			continue;
		}
		//very janky fix for quarterly real fix later
		if(seriesID.startsWith("CI"))
		{
			dataList.add(new Data(currentDate, i));
			currentDate+=1.0/4;
			counter++;
			continue;
		}
		if(seriesID.startsWith("CUUR0000SA0"))
		{
			if((counter%13==0||counter%14==0)&&counter!=0)
			{
				if(counter%14==0)
					counter=0;
				else
					counter++;
				continue;
			}
		}
		if(counter%12==0)
			currentDate = Math.round(currentDate);
		dataList.add(new Data(currentDate, i));
		currentDate+=1.0/12;
		counter++;
	}
        return dataList;
    } catch (Exception ex) {
         Logger.getLogger(GetBLSData.class.getName()).log(Level.SEVERE, null, ex);
         return null;
    }
	

 }
}
