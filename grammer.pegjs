results = ( option / replace / greeting / string)*

option = open:open_tag str:results close:close_tag &{return open.name==close.name}{
	return {
    	type: "option",
    	open: open,
        close: close,
        string: str
    };
}

replace = open:open_tag {
	return {
    	type: "replace",
    	open: open
    };
}

greeting =
'[greeting]'i {
	return {
		type:"greeting",
		location:location()
	}
}

open_tag =
'[' !('/') long:'+'? g:group? name:string ']' {
	return {
		name:name,
        group:g,
        long: long == '+',
		location:location()
	}
}

close_tag =
'[/' g:group? name:string ']' {
	return {
		name:name,
        group:g,
		location:location()
	}
}

group = str:group_string ':' { return str }
group_string = str:group_char+ {return str.join("")}
group_char = [^\[\]:]

string = str:char+ {return str.join("")}
char = [^\[\]]
