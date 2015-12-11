<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <title>Render Domain</title>
</head>
<body>
	<table>
		<tr>
		    <th>Name</th>
		    <th>Age</th>
	    </tr>
	    <g:each in="${list}" var="person">
		   <tr>
		       <td>${person.lastName}, ${person.firstName}</td>
		       <td>${person.age}</td>
		   </tr>
	    </g:each> 
    </table> 
</body>
</html>