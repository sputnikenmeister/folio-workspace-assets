<div class="progress-meter color-bg" style="width: <%= w %>px; height: <%= h %>px">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="color-bg" 
	width="<%= w %>" height="<%= h %>" viewPort="0 0 <%= w %> <%= h %>">
	<g transform="translate(<%= w/2 %> <%= h/2 %>)">
		<!-- <circle id="base" class="color-fill"
			cx="0" cy="0" r="<%= Math.min(w, h)/2 %>"></circle> -->
		<g transform="rotate(<%= sr %> 0 0)">
			<!-- <circle id="steps-track" class="color-stroke"
				cx="0" cy="0" r="<%= r2 %>"
				stroke-width="<%= s2 %>"
				fill="transparent"></circle> -->
			<circle id="steps" class="color-stroke"
				cx="0" cy="0" r="<%= r2 %>"
				stroke-width="<%= s2 %>"
				fill="transparent"></circle>
			<circle id="amount" class="color-stroke"
				cx="0" cy="0" r="<%= r1 %>"
				stroke-width="<%= s1 %>"
				fill="transparent"></circle>
		</g>
		
		<text id="step-label" class="color-reverse color-fill"
			font-weight="600"
			text-anchor="middle"
			font-size="<%= w/2 %>" dy="<%= w/6 %>"></text>
			
		<g id="pause-symbol" transform="scale(0.75 0.75) translate(<%= -r1/2 %> <%= -r1/2 %>)">
			<rect class="color-reverse color-fill"
				width="<%= r1/3 %>" height="<%= r1 %>"></rect>
			<rect class="color-reverse color-fill" x="<%= (r1/3)*2 %>"
				width="<%= r1/3 %>" height="<%= r1 %>"></rect>
		</g>
		
		<!--
		<g transform="translate(<%= -s1/2 %> 0) scale(1.0 0.9)">
			<path class="color-reverse color-fill"
			d="<%= ['M', r1/4, -r1/2, 'h', s1, 'l', -r1/2, r1, 'h', -s1, 'Z'].join(' ') %>"></path>
		</g>
		<g transform="scale(1.05 1.00)">
			<text id="step-label" class="color-reverse color-fill"
				x="<%= -w/6 %>" y="<%= -r1/6 %>"
				text-anchor="middle"
				font-weight="600"
				font-size="<%= w/3 %>" dy="<%= w/9 %>" ></text>
			<text id="stepsnum-label" class="color-reverse color-fill"
				x="<%= w/6 %>" y="<%= r1/6 %>"
				text-anchor="middle"
				font-weight="600"
				font-size="<%= w/3 %>" dy="<%= w/9 %>" ></text>
		</g> -->
		
		<!-- ⅔ \u2154 -->
		<!--
		<text fill="red" fill-opacity="0.3"
			font-weight="600"
			text-anchor="middle"
			font-size="<%= w/2 %>" dy="<%= w/6 %>">&#190;</text>
		<path class="color-reverse color-fill"
			x="0" y="<%= -s1/2 %>"
			d="<%= ['M', -r1/4, r1/2, 'H', s1, 'L', -r1/4, r1/2, 'H', -s1, 'Z'].join(' ') %>"></path>
		<line class="color-stroke"
			x1="<%= -r1/4 %>" y1="<%= r1/2 %>"
			x2="<%= r1/4 %>" y2="<%= -r1/2 %>"
			stroke-width="<%= s1 %>"></line>
		-->
	</g>
</svg>
</div>
