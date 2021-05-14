
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

let cellData = []; // array storing info of each cell in form of an object

for(let i = 1; i <= 100; i++)
{
    let row = $('<div class="cell-row"></div>'); // createElement using jQuery
    let rowArray = [];
    for(let j = 1; j <= 100; j++)
    {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
        rowArray.push({
            'font-family': 'Noto Sans',
            'font-size': 14,
            'text': '',
            'bold': false,
            'italic': false,
            'underlined': false,
            'alignment': 'left',
            'color': '',
            'bgcolor': '',
        });
    }

    cellData.push(rowArray);
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
    $(this).addClass('selected');
    $(this).attr('contenteditable', 'true');
    $(this).focus();
});

// blur event 

$('.input-cell').blur(function(e) {
    $(this).attr('contenteditable', 'false');
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

// click event

$('.input-cell').click(function(e) {
    let [rowId, colId] = getRowCol(this); // receive multiple vars
    let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(rowId, colId);
    if($(this).hasClass('selected'))
    {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
    else selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
});

// select 

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    
    // multiple selection
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
    else // single selection
    {
        $('.input-cell.selected').removeClass('selected top-selected bottom-selected left-selected right-selected');
    }

    $(ele).addClass('selected');
    changeHeader(getRowCol(ele));
} 

function changeHeader([rowId, colId]) {
    let data = cellData[rowId - 1][colId - 1]; // o(1) 
    $('.alignment.selected').removeClass('selected');
    $(`.alignment[data-type="${data.alignment}"]`).addClass('selected'); // get using html attribute

    addRemoveSelectFromFontStyle(data, 'bold');
    addRemoveSelectFromFontStyle(data, 'italic');
    addRemoveSelectFromFontStyle(data, 'underlined');
}

function addRemoveSelectFromFontStyle(data, property) {
    if(data[property])
    {
        $(`#${property}`).addClass('selected');
    }
    else 
    {
        $(`#${property}`).removeClass('selected');
    }
}

// unselect
function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if(e.ctrlKey /*|| isMouseSelectionFinished*/)
    {
        let isTopSelected;
        let isBottomSelected;
        let isLeftSelected;
        let isRightSelected;

        if(topCell) isTopSelected = topCell.hasClass('selected');
        if(bottomCell) isBottomSelected = bottomCell.hasClass('selected');
        if(leftCell) isLeftSelected = leftCell.hasClass('selected');
        if(rightCell) isRightSelected = rightCell.hasClass('selected');

        if(isTopSelected)
        {
            topCell.removeClass('bottom-selected');
        }

        if(isBottomSelected)
        {
            bottomCell.removeClass('top-selected');
        }

        if(isLeftSelected)
        {
            leftCell.removeClass('right-selected');
        }

        if(isRightSelected)
        {
            rightCell.removeClass('left-selected');
        }
    }
    
    $(ele).removeClass('selected top-selected bottom-selected left-selected right-selected');
}

// select using mouse scroll

// let isMouseSelectionFinished = false;
// let isStartCellSelected = false;
// let startCell = {};
// let endCell = {};

// $('.input-cell').mousemove(function(e) {
//     e.preventDefault();
//     if(e.buttons === 1)
//     {
//         if(!isStartCellSelected)
//         {
//             let [rowId, colId] = getRowCol(this);
//             startCell = {'rowId': rowId, 'colId': colId};
//             isStartCellSelected = true;
//             let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(rowId, colId);
//             selectCell($(`#row-${rowId}-col-${colId}`)[0], {'ctrlKey': true}, topCell, bottomCell, leftCell, rightCell);
//         }
//     }
// });

// $('.input-cell').mouseup(function(e) {
//     // reset
//     isStartCellSelected = false;  
//     isMouseSelectionFinished = true;
// });

// $('.input-cell').mouseenter(function(e) {
//     if(e.buttons === 1) // left click
//     {
//        let [rowId, colId] = getRowCol(this);
//        endCell = {'rowId': rowId, 'colId': colId};
//        selectAllBetweenCells(startCell, endCell); 
//     }
// });

// select cells between start and end

function selectAllBetweenCells(start, end) {
    $('.input-cell.selected').removeClass('selected top-selected bottom-selected left-selected right-selected');
    
    for(let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++)
    {
        for(let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++)
        {
            let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], {'ctrlKey': true}, topCell, bottomCell, leftCell, rightCell);
        }
    }
}

$('.alignment').click(function(e) {
    let alignment = $(this).attr('data-type');
    $('.alignment.selected').removeClass('selected');
    $(this).addClass('selected');
    $('.input-cell.selected').css('text-align', alignment);
    $('.input-cell.selected').each(function(index, data) {
        let [rowId, colId] = getRowCol(data);
        cellData[rowId-1][colId-1].alignment = alignment;
    });
});

$('#bold').click(function(e) {
    setStyle(this, 'bold', 'font-weight', 'bold');
});

$('#italic').click(function(e) {
    setStyle(this, 'italic', 'font-style', 'italic');
});

$('#underlined').click(function(e) {
    setStyle(this, 'underlined', 'text-decoration', 'underline');
});

function setStyle(ele, property, key, value) {
    if($(ele).hasClass('selected'))
    {
        $(ele).removeClass('selected');
        $('.input-cell.selected').css(key, ''); // css removed
        $('.input-cell.selected').each(function(index, data) {
            let [rowId, colId] = getRowCol(data);
            cellData[rowId-1][colId-1][property] = false;
        });
    }
    else 
    {
        $(ele).addClass('selected');
        $('.input-cell.selected').css(key, value);
        $('.input-cell.selected').each(function(index, data) {
            let [rowId, colId] = getRowCol(data);
            cellData[rowId-1][colId-1][property] = true;
        });
    }
}