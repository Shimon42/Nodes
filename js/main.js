var space;
var interv;
window.onload = initSpace;

var Nodes = {
    space: null,
    ctx: null,
    childs: Array(),
    linkLength: document.body.clientWidth,
    maxLinks: 0,

    init: function(space, dotAmout, maxLink, makLinkLenght)
    {
        var x = 0;
    
        this.space = space;
        this.ctx = space.ctx;
        while (x++ < dotAmout)
            this.add();
        this.drawNodes();
        this.linkNodes();
    },

    add : function()
    {
        var newNode = Object.create(Node);
        
        var pos = {
            x: rand(0, document.body.clientWidth, true), 
            y: rand(0, document.body.clientHeight, true), 
            z: rand(0, 100, true)
        };
        newNode.init(this, pos, null, "white");
        this.childs.push(newNode);
    },

    drawNodes: function()
    {
        var nodes = this.childs;
        var ctx = this.ctx;

        this.space.clearCanvas();
        for (var key in nodes)
        {
            var node = nodes[key];

           node.move();
        }
    },

    linkNodes: function()
    {
        var nodes = this.childs;
        var ctx = this.ctx;

        for (var x in nodes)
        {
            var node = nodes[x];
            var closest = Array();
            for (var y in nodes)
            {
                var node2 = nodes[y];

                if (node.id != node2.id && (node.linked.length <= node.maxLinks && node2.linked.length <= node2.maxLinks))
                {
                    var dist = Math.sqrt(Math.pow(node2.x - node.x, 2) + Math.pow(node2.y - node.y, 2));
                    
                    if (dist < this.linkLength)
                    {
                        if (!closest.length)
                           closest.push({dist: dist, node: node2});
                        for (var z in closest)
                        {
                            if (dist < closest[z].dist)
                            {
                                closest.slice(z, {dist: dist, node: node2});
                            }
                        }
                    }
                }
            }
            this.treatLinkedList(node, closest);
        }
    },

    treatLinkedList: function(node, src)
    {
        node.linked = Array();
        for (var x = 0; x < src.length && x < node.maxLinks; x++)
        {
            node.linked.push(src[x].node);
            src[x].node.linked.push(node);
        }        
    }

};

var Node = {
    id: null,
    parent: null,
    x: null,
    y: null,
    z: null,
    movingTo: {
        x: null,
        y: null,
        z: null,
    },
    movingSpeed: {
        x: null,
        y: null,
        z: null
    },
    curve: null,
    color: null,
    linked: Array(),
    maxLinks: 5,
    speed: null,

    init: function(parent, pos, curve, color)
    {
        this.parent = parent;
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        this.movingTo = pos;
        this.randNewPos();
        this.curve = curve;
        this.color = color;
        this.maxLinks = rand(2, 3, true, true);
        this.speed = rand(1, 10) * 0.005;
        this.id = this.parent.childs.length;
    },

    move: function()
    {
        if (this.asArrived())
            this.randNewPos();
        if (this.compX() < 0)
            this.x += this.movingSpeed.x;
        else if (this.compX() > 0)
            this.x -= this.movingSpeed.x;
        if (this.compY() < 0)
            this.y += this.movingSpeed.y;
        else if (this.compY() > 0)
            this.y -= this.movingSpeed.y;
        this.draw();
    },

    compX: function()
    {
        if (Math.floor(this.x) < Math.floor(this.movingTo.x))
            return (-1);
        else if (Math.floor(this.x) == Math.floor(this.movingTo.x))
            return (0);
        else if (Math.floor(this.x) > Math.floor(this.movingTo.x))
            return (1);
    },

    compY: function()
    {
        if (Math.floor(this.y) < Math.floor(this.movingTo.y))
            return (-1);
        else if (Math.floor(this.y) == Math.floor(this.movingTo.y))
            return (0);
        else if (Math.floor(this.y) > Math.floor(this.movingTo.y))
            return (1);
    },

    asArrived: function()
    {
        var error = 0;
        if (this.compX() != 0)
            error++;
        if (this.compY() != 0)
            error++;
        return (error == 0);
    },

    randNewPos: function()
    {
        var randX, randY, randZ;
        var padd = 20;
        var movement= 300;
        while (!randX || (randX < 0 - padd && randX > document.body.clientWidth - padd))
            randX = rand(-movement, movement, true, 1);
        while (!randY || (randY < 0 - padd && randY > document.body.clientHeight - padd)) 
            randY = rand(-movement, movement, true, 1);
        
        this.movingTo.x = this.x + randX;
        this.movingSpeed.x = (this.movingTo.x - this.x);
        this.movingSpeed.y = (this.movingTo.y - this.y);

        this.movingTo.y = this.y + randY;
        this.movingTo.z = this.z + randZ;
    },

    draw: function()
    {
        var ctx = this.parent.ctx;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
        this.drawLinks();
    },

    drawLinks: function()
    {
        var linked = this.linked;
        var ctx = this.parent.ctx;
        if (linked)
            for (var x = 0; x < this.maxLinks && x < linked.length; x++)
            {
                ctx.strokeStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(linked[x].x, linked[x].y);
                ctx.stroke();
                ctx.closePath();
            }
    }
};

function initSpace()
{
    var nbrNodes = 50;

    space = Object.create(gestCanvas);
    space.initCanvas("mainCanvas", 0, 0, "126,200,230" );
    Nodes.init(space, nbrNodes);
    interv = setInterval(function(){
        Nodes.drawNodes()
    }, 1000/60);
    setTimeout(function(){
        //clearInterval(interv);
    }, 1000);
}

function rand(min, max, floored, noZero)
{
    var res;

    res = 0;
    if (noZero == 1)
        while (res > -1 && res < 1)
            res = (Math.random() * ((max + 1) - min)) + min;
    else
        res = (Math.random() * ((max + 1) - min)) + min;
    if (floored)
        return (Math.floor(res));
    else
        return (res);
}