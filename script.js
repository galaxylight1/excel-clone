
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

// dblclick event

$('.input-cell').dblclick(function(e) {
    $('.input-cell.selected').removeClass('selected');
    $(this).attr('contenteditable', 'true');
    $(this).focus();
});

// select and unselect cells

function getRowCol(ele) {
    let arr = $(ele).attr('id').split('-');
    return [parseInt(arr[1]), parseInt(arr[3])]; // return multiple vars
}

function getNeighbours(rowId, colId) {
    let topCell = $(`#row-${rowId-1}-col-${colId}`); // getElement using jQuery
    let bottomCell = $(`#row-${rowId+1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId-1}`);
    let rightCell = $(`#row-${rowId}-col-${colId+1}`);

    return [topCell, bottomCell, leftCell, rightCell];
}

$('.input-cell').click(function(e) {
    let [rowId, colId] = getRowCol(this); // receive multiple vars
    let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(rowId, colId);
    selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
});

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    
    // Multiple Selection
    if(e.ctrlKey)
    {
        // first, we want to check whether any of the 4 cells (top, bottom, left, right) are selected or not

        // bools
        let isTopSelected;
        let isBottomSelected;
        let isLeftSelected;
        let isRightSelected;

        if(topCell) isTopSelected = topCell.hasClass('selected');
        if(bottomCell) isBottomSelected = bottomCell.hasClass('selected');
        if(leftCell) isLeftSelected = leftCell.hasClass('selected');
        if(rightCell) isRightSelected = rightCell.hasClass('selected');

        // we have the information of our neighbours now
        if(isTopSelected)
        {
            $(ele).addClass('top-selected');
            topCell.addClass('bottom-selected');
        }

        if(isBottomSelected)
        {
            $(ele).addClass('bottom-selected');
            bottomCell.addClass('top-selected');
        }

        if(isLeftSelected)
        {
            $(ele).addClass('left-selected');
            leftCell.addClass('right-selected');
        }

        if(isRightSelected)
        {
            $(ele).addClass('right-selected');
            rightCell.addClass('left-selected');
        }
    }
    else
    {
        $('.input-cell.selected').removeClass('selected top-selected bottom-selected left-selected right-selected');
    }

    $(ele).addClass('selected');
} 