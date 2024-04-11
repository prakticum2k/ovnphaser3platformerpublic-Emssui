
class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene'});
    };

    Text;

    preload() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height; // Corrected typo
    
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
    
        progressBox.fillRect(width / 2 - 30, height / 2 - 30, 2, 2);
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 70,
            text: 'Level 1',
            style: {
                font: '40px monospace',
                fill: '#ddddd'
            }
        });
    
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '22px monospace',
                fill: '#ddddd'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '22px monospace',
                fill: '#ddddd'
    
            }
        });
        assetText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 160, height / 2 - 30, 320 * value, 50);
        });
        
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
    
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    
        this.load.image('player1', 'assets/images/piskel1.png');
        this.load.image('player2', 'assets/images/piskel2.png');

        this.load.image('coin1', 'assets/images/coin1.png');
        this.load.image('coin2', 'assets/images/coin2.png');

        // load tileset
        this.load.image('tiles', 'assets/tiles/spritesheet.png');

        // load tilemap
        this.load.tilemapTiledJSON('map', 'assets/tiles/map.json');

        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('ceiling', 'assets/images/untitled.png');  
        this.load.image('lava', 'assets/images/lava.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('red', 'assets/images/red.png');

        // Movement 
        this.load.image('up', 'assets/images/up.png');
        this.load.image('left', 'assets/images/left.png');
        this.load.image('right', 'assets/images/right.png');

        this.load.audio('jump', 'assets/audios/jump.mp3');
        this.load.audio('coinSound', 'assets/audios/coin.mp3');

        for(let i= 0; i < 500; i++) {
            this.load.image('ground' + i, 'assets/images/ground.png');
        }

        this.isMobile = this.checkIsMobile();
    };

    create() {
        scoreManager.level = 0
        scoreManager.level = 1;
        
        this.up = this.add.sprite(1480, 700,'up').setInteractive().setScrollFactor(0);
        this.left = this.add.sprite(300, 700,'left').setInteractive().setScrollFactor(0);
        this.right = this.add.sprite(500, 700,'right').setInteractive().setScrollFactor(0);

        this.up.setScale(0.2).setDepth(3).setVisible(false);
        this.right.setScale(0.2).setDepth(3).setVisible(false);
        this.left.setScale(0.2).setDepth(3).setVisible(false);        

        const map = this.make.tilemap({ 
            key: 'map'
        });

        const tileset = map.addTilesetImage('spritesheet', 'tiles');

        this.groundLayer = map.createLayer('Tile Layer 1', tileset, -600, -600);
        const layer = map.createLayer('walls', tileset, -600, -600);

        var player1 = this.physics.add.sprite(340, 400, 'player1');
        this.lava = this.physics.add.sprite(1950, 930, 'lava');
        this.btn = this.physics.add.sprite(5950, 1400, 'button');
        
        this.lava.setDepth(-1)
        this.lava.setScale(17,1)
        this.lava.body.allowGravity = false; // Disable gavity for the lava  

        this.btn.setDepth(-1)
        this.btn.body.allowGravity = false; // Disable gavity for the lava  

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.Text = this.add.text(300, 350, 'Level 1', { fontSize: '50px', fill: '#fff' });

        this.jump = this.sound.add('jump');
        this.coinSound = this.sound.add('coinSound');

        this.jump.volume = 0.1;
        this.coinSound.volume = 0.3;

        // Create animation
        this.anims.create({
            key: 'playerFrames',
            frames:[
                {key: 'player1'},
                {key: 'player2'},
            ],
            frameRate: 4,
            repeat: -1
        });

        player1.play('playerFrames');

        // Set physics properties on the sprite directly, not on the animation
        player1.setBounce(0);
        player1.setDrag(100);
        player1.setGravityY(300);
        player1.setScale(0.6);

        // Store the player reference for movement
        this.player = player1;

        // Create an array to store coin sprites
        this.coins = this.physics.add.group({
            key: 'coin1',
            repeat: 33, // Number of coins to create
            setXY: { x: 1000, y: 100, stepX: 140 } // Position of the first coin and the distance between coins
        });

        // Set properties for each coin
        this.coins.children.iterate(function (coin) {
            coin.setScale(0.15); // Adjust scale as needed
            coin.setGravityY(500);
            this.physics.add.collider(coin,layer);
            coin.setBounce(0.5);

            // Define coin animation for each coin
            coin.anims.create({
                key: 'coinframes',
                frames:[
                    {key: 'coin1'},
                    {key: 'coin2'}
                ],
                frameRate: 3, // Adjust frame rate as needed
                repeat: -1 // Loop indefinitely
            });

            // Play coin animation for each coin
            coin.play('coinframes');
        }, this);

        // Initialize score
        this.score = 0;

        // Create score text
        this.scoreText = this.add.text(20, 60, 'Score: 0', { fontSize: '50px', fill: '#fff' });       

        // Set up collision between player and coins
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.cameras.main.zoomTo(1.3);

        // Setup keyboard keys for movement
        this.keys = this.input.keyboard.addKeys('W,A,S,D,right,left,up');

        // Boolean to check if the player is on the ground
        this.isPlayerOnGround = false;

        // Create ground group
        this.groundGroup = this.physics.add.staticGroup();

        this.groundLayer.setCollisionBetween(0, 100);
        layer.setCollisionBetween(0, 100);

        // Check for overlap with ground to update isPlayerOnGround flag
        this.physics.add.collider(player1, this.groundLayer, () => {
            this.isPlayerOnGround = true;
        }, null, this);

        this.physics.add.collider(this.coins, this.groundLayer);
        this.physics.add.collider(player1, layer);

        this.score = 0;
        
        // lava restart
        this.physics.add.collider(this.player, this.lava, () => {
            this.sound.stopAll();
            this.scene.start("DeathScene");
        });

        this.physics.add.collider(this.player, this.btn, () => {
            this.sound.stopAll();
            this.scene.start("GameScene2");
        });

        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: this.createLeaves,
            callbackScope: this
        });

        // Ground check hitbox
        this.groundHitbox = this.physics.add.sprite(player1.x, player1.y + player1.height / 2, 'ground');
        this.groundHitbox.setVisible(false);

        
        if(this.isMobile) {
            this.up.setVisible(true);
            this.left.setVisible(true);
            this.right.setVisible(true);
        }

        this.up.on('pointerdown', () => {
            this.moveMobilePlayer('up');
        });
    
        this.left.on('pointerdown', () => {
            this.keys.A.isDown = true;
        });
    
        this.right.on('pointerdown', () => {
            this.keys.D.isDown = true;
        });
    
        // Add event listeners to stop movement when images are released
        this.left.on('pointerup', () => {
            this.keys.A.isDown = false;
        });
    
        this.right.on('pointerup', () => {
            this.keys.D.isDown = false;
        });
    };

    update() {
        if(this.player.body.velocity.y > 0) {
            this.isPlayerOnGround = false;
        }

        this.cameras.main.scrollX = this.player.x - this.cameras.main.width / 2;
        this.movePlayer();

        this.scoreText.setPosition(this.player.x - 100, 250);
        this.groundHitbox.setPosition(this.player.x, this.player.y + this.player.height / 2);
    };
    
    collectCoin(player, coin) {
        coin.disableBody(true, true); // Remove the coin from the screen
        scoreManager.increaseScore(10); // Increase the score
        this.coinSound.play();
        this.scoreText.setText("Score: " + scoreManager.getScore()); // Update score text
    }

    checkIsMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }
    
    createLeaves() {
        const leafPositions = [
            { x: Phaser.Math.Between(570, 5370), y: 0 },
        ];
        
        leafPositions.forEach(pos => {
            const leaf = this.physics.add.image(pos.x, pos.y, 'red');

            leaf.setDepth(2)            
            leaf.setBounce(0);
            leaf.setDrag(100);
            leaf.setGravityY(300); 

            this.physics.add.collider(leaf, this.player, () => {
                this.scene.start("DeathScene");
            });

            this.tweens.add({
                targets: leaf,
                angle: leaf.angle + 10,
                repeat: 0 
            });
        });
        
    }

    movePlayer(direction) {
        if (this.keys.A.isDown) {
            // Move the player to the left
            this.player.setVelocityX(-400);
        } else if (this.keys.D.isDown) {
            // Move the player to the right
            this.player.setVelocityX(400);
        }
        // If neither the A or D key or left or right arrow key is pressed
        else {
            // Stop the player
            this.player.setVelocityX(0);
        }

        // If the W key or up arrow key is pressed and the player is on the ground
        if ((this.keys.W.isDown || this.keys.up.isdown) && this.isPlayerOnGround) {
            this.jump.play();
            // Move the player upward (jump)
            this.player.setVelocityY(-320);
            // Set the player to not be on the ground
            this.isPlayerOnGround = false;
        }
    }

    moveMobilePlayer(direction) {
        if (direction === 'up' && this.isPlayerOnGround) {
            this.player.setVelocityY(-320);
            this.jump.play();
            this.isPlayerOnGround = false;
        }
    }
};

