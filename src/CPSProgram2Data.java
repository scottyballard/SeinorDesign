import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
 
public class CPSProgram2Data {
 public static void main(String[] args) throws IOException 
 {
	//String urlParameters="request_action=show_formatting&initial_request=false&data_tool=latest_numbers&series_id=LNS15026639&years_option=specific_years&include_graphs=false&to_year=2017&from_year=2000&original_include_graphs=false";
	int currentYear = Calendar.getInstance().get(Calendar.YEAR);
	String urlParameters="request_action=get_data&reformat=true&from_results_page=true&years_option=specific_years&delimiter=comma&output_type=multi&periods_option=all_periods&output_view=data&to_year="+Integer.toString(currentYear)+"&from_year=2000&output_format=text&original_output_type=default&annualAveragesRequested=false&series_id=LNS15026639";
	  
	byte[] postData       = urlParameters.getBytes( StandardCharsets.UTF_8 );
	int    postDataLength = postData.length;
	String request        = "https://data.bls.gov/pdq/SurveyOutputServlet";
	URL    url            = new URL( request );
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
	BufferedReader is=new BufferedReader(new InputStreamReader(conn.getInputStream()));
	String inputLine;
	while ((inputLine = is.readLine()) != null)
	{
		System.out.println(inputLine);
		f.write(inputLine);
	}
	f.close();
	is.close();

 }
}
