package com.restlet.sqlimport.parser;

import com.restlet.sqlimport.model.sql.Column;
import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.model.sql.ForeignKey;
import com.restlet.sqlimport.model.sql.Table;
import com.restlet.sqlimport.parser.SqlParser.Alter_table_add_constraintContext;
import com.restlet.sqlimport.parser.SqlParser.Alter_table_stmtContext;
import com.restlet.sqlimport.parser.SqlParser.Any_nameContext;
import com.restlet.sqlimport.parser.SqlParser.Fk_origin_column_nameContext;
import com.restlet.sqlimport.parser.SqlParser.Fk_target_column_nameContext;
import com.restlet.sqlimport.parser.SqlParser.Foreign_tableContext;
import com.restlet.sqlimport.parser.SqlParser.Indexed_columnContext;
import com.restlet.sqlimport.parser.SqlParser.Source_table_nameContext;
import com.restlet.sqlimport.parser.SqlParser.Table_constraint_foreign_keyContext;
import com.restlet.sqlimport.parser.SqlParser.Table_constraint_primary_keyContext;
import com.restlet.sqlimport.util.Util;

/**
 * Parse Listener only for ALTER TABLE statements parsing.
 */
public class InsertParseListener extends SqlBaseListener {


	/**
	 * Debug mode to display ANTLR v4 contexts.
	 */
	private static boolean DEBUG = false;

	/**
	 * ANTLR Parser
	 */
	private final SqlParser sqlParser;

	/**
	 * Database schema
	 */
	private final Database database;

	Table table;
	Column column;
	ForeignKey foreignKey;

	boolean inAlter_table_stmt = false; // ALTER TABLE
	boolean inAlter_table_add_constraint = false; // ALTER TABLE with ADD CONSTRAINT
	boolean inTable_constraint_primary_key = false; // PRIMARY KEY in ALTER TABLE
	boolean inTable_constraint_foreign_key = false; // FOREIGN KEY in ALTER TABLE

	/**
	 * Utils methods.
	 */
	Util util = new Util();

	/**
	 * Constructor.
	 * @param sqlParser SQL parser
	 * @param database Database
	 */
	public InsertParseListener(final SqlParser sqlParser, final Database database) {
		this.sqlParser = sqlParser;
		this.database = database;
	}

	/**
	 * Used only for debug, its called for each token based on the token "name".
	 */
	@Override
	public void exitAny_name(final Any_nameContext ctx) {
		if(DEBUG) {
			//System.out.println(ctx.getText() + " - ctx : " + ctx.toInfoString(sqlParser));
		}
	}
}
