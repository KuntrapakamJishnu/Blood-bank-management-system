/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login (donor, hospital, or blood-lab)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b8c678e1f0c20f446e3e6a"
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: donor
 *                     status:
 *                       type: string
 *                       example: approved
 *                 redirect:
 *                   type: string
 *                   example: "/donor"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                     redirect:
 *                       type: string
 *       400:
 *         description: Email and password are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       403:
 *         description: Access denied due to account status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Your account is awaiting admin approval. Please wait before logging in."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login failed"
 *                 error:
 *                   type: string
 *                   example: "Your error message here"
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (donor, hospital, or blood-lab)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [donor, hospital, blood-lab]
 *                 example: donor
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Donor registered successfully! Redirecting to dashboard..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b8c678e1f0c20f446e3e6a"
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: donor
 *                 redirect:
 *                   type: string
 *                   example: "/donor/dashboard"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     redirect:
 *                       type: string
 *       400:
 *         description: Role is required or invalid role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role is required"
 *       500:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration failed"
 *                 error:
 *                   type: string
 *                   example: "Your error message here"
 */


/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Fetch user profile information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile fetched successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b8c678e1f0c20f446e3e6a"
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: donor
 *                     status:
 *                       type: string
 *                       example: approved
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Error fetching user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching profile"
 *                 error:
 *                   type: string
 *                   example: "Your error message here"
 */

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Request OTP for registration via email, SMS, or both
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               channel:
 *                 type: string
 *                 enum: [email, sms, both]
 *                 example: both
 *               purpose:
 *                 type: string
 *                 enum: [register]
 *                 example: register
 *     responses:
 *       200:
 *         description: OTP requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 expiresInMinutes:
 *                   type: number
 *                   example: 10
 *                 delivery:
 *                   type: object
 *                 providerStatus:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                       properties:
 *                         resendConfigured:
 *                           type: boolean
 *                         fromEmail:
 *                           type: boolean
 *                     sms:
 *                       type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     delivery:
 *                       type: object
 *                     providerStatus:
 *                       type: object
 *       400:
 *         description: Validation or missing channel requirements
 *       503:
 *         description: OTP delivery provider unavailable
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code for registration channel
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               channel:
 *                 type: string
 *                 enum: [email, sms]
 *                 example: email
 *               code:
 *                 type: string
 *                 example: 123456
 *               purpose:
 *                 type: string
 *                 enum: [register]
 *                 example: register
 *     responses:
 *       200:
 *         description: OTP verification response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 verifiedChannels:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: boolean
 *                     sms:
 *                       type: boolean
 *                 allRequiredVerified:
 *                   type: boolean
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: OTP not found
 */

/**
 * @swagger
 * /api/auth/otp-status:
 *   post:
 *     summary: Admin-only OTP status debug endpoint
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               purpose:
 *                 type: string
 *                 enum: [register]
 *                 default: register
 *     responses:
 *       200:
 *         description: OTP debug status fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otp:
 *                   type: object
 *                   nullable: true
 *                 providerStatus:
 *                   type: object
 *                 data:
 *                   type: object
 */