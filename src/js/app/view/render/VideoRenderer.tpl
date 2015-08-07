<div class="placeholder sizing"></div>
<div class="content play-toggle not-played">
	<video preload="none">
		<% srcset.forEach(function (item) { %>
			<source src="<%= item.src %>" type="<%= item.mime %>"></source> 
		<% }) %>
	</video>
	<img class="poster default current" alt="<%= name %>"/>
	<div class="overlay">
		<span class="play-button">&#xe805;</span>
	</div>
</div>
