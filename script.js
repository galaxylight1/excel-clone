
const ps = new PerfectScrollbar('#cells', {
    wheelSpeed: 2
});

for(let i = 1; i <= 100; i++)
{
    let str = '';
    let n = i;

    while(n > 0)
    {
        let rem = n % 26;
        if(rem === 0)
        {
            str = 'Z' + str;
            n = Math.floor(n / 26) - 1;
        }
        else
        {
            str = String.fromCharCode((rem-1) + 65) + str;
            n = Math.floor(n / 26);
        }
    }

    $('#columns').append(`<div class="column-name">${str}</div>`);
    $('#rows').append(`<div class="row-name">${i}</div>`);
}

for(let i = 1; i <= 100; i++)
{
    let row = $('<div class="cell-row"></div>'); // createElement using jQuery
    for(let j = 1; j <= 100; j++)
    {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
    }
    $('#cells').append(row);
}

// fixing scroll of #columns and #rows when scrolling with perfectScrollbar

$('#cells').scroll(function(e) {
    $('#columns').scrollLeft(this.scrollLeft); // only scrollLeft exists in perfectScrollbar
    $('#rows').scrollTop(this.scrollTop); // only scrollLeft exists in perfectScrollbar
});

// select and unselect cells

function getRowCol(ele) {
    let arr = $(ele).attr('id').split('-');
    return [parseInt(arr[1]), parseInt(arr[3])];
}

$('.input-cell').click(function(e) {
    let [rowId, colId] = getRowCol(this);
    selectCell(this);
});

function selectCell(ele) {
    $('.input-cell.selected').removeClass('selected');
    $(ele).addClass('selected');
} 