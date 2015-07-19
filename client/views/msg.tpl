{{#each messages}}
<div class="msg {{type}} {{#if self}}self{{/if}}">
	<span class="time">
		{{tz time}}
	</span>
	<span class="from">
		{{#if from}}
			<button class="user" style="color: #{{stringcolor from}}">{{mode}}{{from}}
			{{#if userImage}}
				<img src="{{userImage}}" class="user-image">
			{{/if}}
			</button>
		{{/if}}
	</span>
	<span class="text">
		<em class="type">{{type}}</em>
		{{#equal type "toggle"}}
			<div class="force-newline">
				<button id="toggle-{{id}}" class="toggle-button">···</button>
			</div>
			{{#if toggle}}
				{{partial "toggle"}}
			{{/if}}
		{{else}}
			{{{parse text}}}
		{{/equal}}
	</span>
</div>
{{/each}}
