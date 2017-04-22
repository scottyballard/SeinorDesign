

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class SelectServlet
 */
@WebServlet("/SelectServlet")
public class SelectServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       

    public SelectServlet() {
        super();
    }
    /**
     * <p>Servlet to service requests for Data</p>
     * Uses POST to get the name of a group of Metrics and returns them as a JSON array
     */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		response.addHeader("Content-Type", "application/json");
		String tableName = request.getHeader("name");
		String jsonResult = DataController.getGroup(tableName);
		PrintWriter print = response.getWriter();
		print.print(jsonResult);		
	}

}
