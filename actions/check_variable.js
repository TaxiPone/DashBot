module.exports = {

name: "Check Variable",

section: "Conditions",

subtitle: function(data) {
	const results = ["Continue Actions", "Stop Action Sequence", "Jump To Action", "Jump Forward Actions"];
	return `If True: ${results[parseInt(data.iftrue)]} ~ If False: ${results[parseInt(data.iffalse)]}`;
},

fields: ["storage", "varName", "comparison", "value", "iftrue", "iftrueVal", "iffalse", "iffalseVal"],

html: function(isEvent, data) {
	return `
<div>
	<div style="float: left; width: 35%;">
		Variable:<br>
		<select id="storage" class="round" onchange="glob.refreshVariableList(this)">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text" list="variableList">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 45%;">
		Comparison Type:<br>
		<select id="comparison" class="round" onchange="glob.onChange1(this)">
			<option value="0">Exists</option>
			<option value="1" selected>Equals</option>
			<option value="2">Equals Exactly</option>
			<option value="3">Less Than</option>
			<option value="4">Greater Than</option>
			<option value="5">Includes</option>
			<option value="6">Matches Regex</option>
		</select>
	</div>
	<div style="float: right; width: 50%;" id="directValue">
		Value to Compare to:<br>
		<input id="value" class="round" type="text" name="is-eval">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	${data.conditions[0]}
</div>`
},

init: function() {
	const {glob, document} = this;

	glob.onChange1 = function(event) {
		if(event.value === "0") {
			document.getElementById("directValue").style.display = 'none';
		} else {
			document.getElementById("directValue").style.display = null;
		}
	};

	glob.refreshVariableList(document.getElementById('storage'));
	glob.onChangeTrue(document.getElementById('iftrue'));
	glob.onChangeFalse(document.getElementById('iffalse'));
},

action: function(cache) {
	const data = cache.actions[cache.index];
	const type = parseInt(data.storage);
	const varName = this.evalMessage(data.varName, cache);
	const variable = this.getVariable(type, varName, cache);
	let result = false;
	if(variable) {
		const val1 = variable;
		const compare = parseInt(data.comparison);
		let val2 = this.evalMessage(data.value, cache);
		if(compare !== 6) val2 = this.eval(val2, cache);
		if(val2 === false) val2 = this.evalMessage(data.value, cache);
		switch(compare) {
			case 0:
				result = Boolean(val1 !== undefined);
				break;
			case 1:
				result = Boolean(val1 == val2);
				break;
			case 2:
				result = Boolean(val1 === val2);
				break;
			case 3:
				result = Boolean(val1 < val2);
				break;
			case 4:
				result = Boolean(val1 > val2);
				break;
			case 5:
				if(typeof(val1.includes) === 'function') {
					result = Boolean(val1.includes(val2));
				}
				break;
			case 6:
				result = Boolean(val1.match(new RegExp('^' + val2 + '$', 'i')));
				break;
		}
	}
	this.executeResults(result, data, cache);
},

mod: function(DBM) {
}

}; // End of module
